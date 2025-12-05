import os
import chromadb
# from langchain_google_genai import GoogleGenerativeAIEmbeddings
from langchain_huggingface import HuggingFaceEmbeddings
from chromadb.config import Settings
from dotenv import load_dotenv

load_dotenv() # Load environment variables from .env

# 초기 금지어/상표권 데이터셋 (예시)
INITIAL_BANNED_KEYWORDS = [
    {"keyword": "코멧", "reason": "쿠팡 PB 브랜드 상표권", "category": "brand"},
    {"keyword": "탐사", "reason": "쿠팡 PB 브랜드 상표권", "category": "brand"},
    {"keyword": "곰곰", "reason": "쿠팡 PB 브랜드 상표권", "category": "brand"},
    {"keyword": "나이키", "reason": "글로벌 스포츠 브랜드 상표권", "category": "brand"},
    {"keyword": "아디다스", "reason": "글로벌 스포츠 브랜드 상표권", "category": "brand"},
    {"keyword": "삼성", "reason": "대기업 상표권", "category": "brand"},
    {"keyword": "LG", "reason": "대기업 상표권", "category": "brand"},
    {"keyword": "다이소", "reason": "유통 기업 상표권", "category": "brand"},
    {"keyword": "마약", "reason": "플랫폼 금지 키워드 (과장 광고)", "category": "prohibited"},
    {"keyword": "최고", "reason": "객관적 근거 없는 최상급 표현 주의", "category": "warning"},
]

class SafetyVectorDB:
    def __init__(self):
        # PersistentClient 사용
        self.client = chromadb.PersistentClient(path="./chroma_db")
        self.collection_name = "banned_keywords"
        
        # 임베딩 모델 설정 (Local HuggingFace)
        # Multilingual model for better Korean support
        self.embedding_function = HuggingFaceEmbeddings(model_name="sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2")
        
        # 컬렉션 생성 또는 가져오기
        try:
            self.collection = self.client.get_or_create_collection(
                name=self.collection_name,
                metadata={"hnsw:space": "cosine"}
            )
        except Exception as e:
            print(f"Error creating collection: {e}")
            # Fallback or re-raise
            raise e
        
        # 데이터가 비어있으면 초기 데이터 주입
        if self.collection.count() == 0:
            self._initialize_db()

    def _initialize_db(self):
        print("Initializing Vector DB with banned keywords...")
        ids = [str(i) for i in range(len(INITIAL_BANNED_KEYWORDS))]
        documents = [item["keyword"] for item in INITIAL_BANNED_KEYWORDS]
        metadatas = [{"reason": item["reason"], "category": item["category"]} for item in INITIAL_BANNED_KEYWORDS]
        
        # 임베딩 생성 (LangChain wrapper가 아닌 ChromaDB에 직접 넣을 때는 
        # Chroma가 기본 임베딩을 쓰거나, 우리가 임베딩 값을 계산해서 넣어야 함.
        # 여기서는 간단하게 텍스트만 저장하고 쿼리 시점에 비교하거나,
        # LangChain의 VectorStore 클래스를 쓰는게 더 편할 수 있음.
        # 하지만 의존성을 줄이기 위해 여기서는 직접 구현보다는
        # LangChain의 Chroma wrapper를 쓰는게 낫겠음.
        pass 

    # LangChain Chroma Wrapper를 사용하는 방식으로 변경
    def get_vectorstore(self):
        from langchain_chroma import Chroma
        
        vectorstore = Chroma(
            collection_name=self.collection_name,
            embedding_function=self.embedding_function,
            persist_directory="./chroma_db"
        )
        
        # 데이터가 없으면 추가
        if self.collection.count() == 0:
            print("Adding initial banned keywords to Vector DB...")
            texts = [item["keyword"] for item in INITIAL_BANNED_KEYWORDS]
            metadatas = [{"reason": item["reason"], "category": item["category"]} for item in INITIAL_BANNED_KEYWORDS]
            vectorstore.add_texts(texts=texts, metadatas=metadatas)
            
        return vectorstore

    def check_safety(self, query: str, threshold=0.8):
        """
        쿼리 키워드가 금지어와 유사한지 검사
        """
        db = self.get_vectorstore()
        # 유사도 검색 (Score가 높을수록 유사함, 코사인 유사도 기준)
        # Chroma의 similarity_search_with_score는 거리(distance)를 반환할 수도 있으므로 확인 필요.
        # LangChain Chroma는 기본적으로 L2 distance를 쓸 수 있음. 
        # 여기서는 similarity_search_with_relevance_scores 사용 권장.
        
        results = db.similarity_search_with_relevance_scores(query, k=1)
        
        if not results:
            return {"is_safe": True, "reason": "No match found"}
            
        doc, score = results[0]
        
        # Score가 threshold보다 높으면 위험 (유사함)
        if score > threshold:
            return {
                "is_safe": False,
                "matched_keyword": doc.page_content,
                "reason": doc.metadata["reason"],
                "score": score
            }
        
        return {"is_safe": True, "reason": "Low similarity", "score": score}

# 싱글톤 인스턴스
safety_db = SafetyVectorDB()
