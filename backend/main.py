"""
RettBot+ Backend API
FastAPI REST API for zero-knowledge AI legal assistant
"""

from fastapi import FastAPI, HTTPException, Depends, File, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from pydantic import BaseModel, Field
from typing import List, Optional, Dict, Any
import uvicorn
import os
from dotenv import load_dotenv
import logging
from datetime import datetime

# Import AI engine
from ai_engine.openai_integration import OpenAIEngine

# Load environment variables
load_dotenv()

# Configure logging
logging.basicConfig(
    level=os.getenv("LOG_LEVEL", "INFO"),
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s"
)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(
    title="RettBot+ API",
    description="Zero-knowledge AI legal assistant for Norwegian citizens",
    version="1.0.0"
)

# CORS Configuration
cors_origins = os.getenv("CORS_ORIGINS", "http://localhost:5173").split(",")
app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize OpenAI Engine
ai_engine = OpenAIEngine()

# ============================================
# Request/Response Models
# ============================================

class EvidenceAnalysisRequest(BaseModel):
    """Request for evidence analysis"""
    file_name: str = Field(..., description="Name of the evidence file")
    file_type: str = Field(..., description="MIME type of file")
    file_size: int = Field(..., description="Size in bytes")
    description: Optional[str] = Field(None, description="User description of evidence")
    case_context: Optional[str] = Field(None, description="Context of the case")
    encrypted_content: str = Field(..., description="Base64 encrypted file content")

class LegalResearchRequest(BaseModel):
    """Request for legal research"""
    query: str = Field(..., description="Legal question to research")
    case_type: Optional[str] = Field(None, description="Type of case (criminal, civil, etc.)")
    context: Optional[str] = Field(None, description="Additional context")
    encrypted_data: Optional[str] = Field(None, description="Encrypted case data")

class DefenseStrategyRequest(BaseModel):
    """Request for defense strategy"""
    case_facts: str = Field(..., description="Facts of the case")
    charges: str = Field(..., description="Criminal charges or allegations")
    evidence: Optional[List[str]] = Field(None, description="List of evidence")
    legal_research: Optional[str] = Field(None, description="Previous research results")
    encrypted_data: Optional[str] = Field(None, description="Encrypted case data")

class LegalDocumentRequest(BaseModel):
    """Request for legal document drafting"""
    document_type: str = Field(..., description="Type of document (motion, complaint, appeal)")
    case_details: Dict[str, Any] = Field(..., description="Case information")
    strategy: Optional[str] = Field(None, description="Defense strategy to incorporate")
    template: Optional[str] = Field(None, description="Specific template to use")

class CorruptionAssessmentRequest(BaseModel):
    """Request for corruption case assessment"""
    allegations: str = Field(..., description="Corruption allegations")
    evidence: List[str] = Field(..., description="Available evidence")
    institutions: List[str] = Field(..., description="Institutions involved")
    context: Optional[str] = Field(None, description="Additional context")

class HealthCheckResponse(BaseModel):
    """Health check response"""
    status: str
    timestamp: str
    openai_configured: bool

# ============================================
# API Endpoints
# ============================================

@app.get("/", response_model=HealthCheckResponse)
async def root():
    """Root endpoint - health check"""
    return HealthCheckResponse(
        status="online",
        timestamp=datetime.utcnow().isoformat(),
        openai_configured=bool(os.getenv("OPENAI_API_KEY"))
    )

@app.get("/api/health")
async def health_check():
    """Detailed health check"""
    return {
        "status": "healthy",
        "timestamp": datetime.utcnow().isoformat(),
        "services": {
            "openai": bool(os.getenv("OPENAI_API_KEY")),
            "api": True,
            "database": False,  # TODO: Add database check
            "redis": False  # TODO: Add Redis check
        },
        "version": "1.0.0"
    }

@app.post("/api/evidence/analyze")
async def analyze_evidence(request: EvidenceAnalysisRequest):
    """
    Analyze uploaded evidence using AI
    
    Note: File content should be encrypted on client-side.
    Server only sees encrypted data (zero-knowledge architecture).
    """
    try:
        logger.info(f"Analyzing evidence: {request.file_name} ({request.file_type})")
        
        # In zero-knowledge mode, we work with encrypted data
        # For demo, we'll analyze based on metadata
        # In production, client would decrypt locally, send to AI, re-encrypt results
        
        assessment = await ai_engine.analyze_evidence(
            file_name=request.file_name,
            file_type=request.file_type,
            description=request.description or "",
            case_context=request.case_context or ""
        )
        
        return {
            "success": True,
            "assessment": {
                "relevance": assessment.relevance,
                "legal_value": assessment.legal_value,
                "evidence_type": assessment.evidence_type,
                "suggested_category": assessment.suggested_category,
                "chain_of_custody": assessment.chain_of_custody,
                "potential_issues": assessment.potential_issues,
                "recommendations": assessment.recommendations,
                "auto_tags": assessment.auto_tags,
                "related_laws": assessment.related_laws,
                "summary": assessment.summary,
                "confidence": assessment.confidence
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error analyzing evidence: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Analysis failed: {str(e)}")

@app.post("/api/legal/research")
async def legal_research(request: LegalResearchRequest):
    """
    Perform legal research using AI
    
    Searches Norwegian law, ECHR cases, precedents
    """
    try:
        logger.info(f"Legal research query: {request.query[:100]}...")
        
        research = await ai_engine.legal_research(
            query=request.query,
            case_type=request.case_type,
            context=request.context or ""
        )
        
        return {
            "success": True,
            "research": {
                "answer": research.answer,
                "norwegian_laws": research.norwegian_laws,
                "echr_cases": research.echr_cases,
                "precedents": research.precedents,
                "citations": research.citations,
                "confidence": research.confidence,
                "recommendations": research.recommendations
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error in legal research: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Research failed: {str(e)}")

@app.post("/api/defense/strategy")
async def build_defense_strategy(request: DefenseStrategyRequest):
    """
    Build comprehensive defense strategy using AI
    
    Analyzes case facts, charges, evidence to create multi-layered defense
    """
    try:
        logger.info(f"Building defense strategy for charges: {request.charges[:100]}...")
        
        strategy = await ai_engine.build_defense_strategy(
            case_facts=request.case_facts,
            charges=request.charges,
            evidence=request.evidence or [],
            legal_research=request.legal_research
        )
        
        return {
            "success": True,
            "strategy": {
                "primary_theory": strategy.primary_theory,
                "weaknesses": strategy.weaknesses,
                "alternative_defenses": strategy.alternative_defenses,
                "procedural_challenges": strategy.procedural_challenges,
                "motion_strategy": strategy.motion_strategy,
                "risk_assessment": strategy.risk_assessment,
                "next_steps": strategy.next_steps
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error building defense strategy: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Strategy generation failed: {str(e)}")

@app.post("/api/legal/document")
async def draft_legal_document(request: LegalDocumentRequest):
    """
    Draft professional legal documents
    
    Generates motions, complaints, appeals, briefs
    """
    try:
        logger.info(f"Drafting {request.document_type} document")
        
        document = await ai_engine.draft_legal_document(
            document_type=request.document_type,
            case_details=request.case_details,
            strategy=request.strategy,
            template=request.template
        )
        
        return {
            "success": True,
            "document": {
                "type": request.document_type,
                "content": document,
                "metadata": {
                    "created": datetime.utcnow().isoformat(),
                    "case_number": request.case_details.get("case_number"),
                    "court": request.case_details.get("court")
                }
            },
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error drafting document: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Document drafting failed: {str(e)}")

@app.post("/api/corruption/assess")
async def assess_corruption_case(request: CorruptionAssessmentRequest):
    """
    Assess corruption case and recommend escalation path
    
    Analyzes systematic corruption patterns and suggests 8-level escalation
    """
    try:
        logger.info(f"Assessing corruption case involving: {', '.join(request.institutions)}")
        
        assessment = await ai_engine.assess_corruption_case(
            allegations=request.allegations,
            evidence=request.evidence,
            institutions=request.institutions,
            context=request.context or ""
        )
        
        return {
            "success": True,
            "assessment": assessment,
            "timestamp": datetime.utcnow().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Error assessing corruption case: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Corruption assessment failed: {str(e)}")

@app.post("/api/evidence/upload")
async def upload_evidence_file(
    file: UploadFile = File(...),
    description: Optional[str] = None,
    case_id: Optional[str] = None
):
    """
    Upload evidence file (encrypted on client before upload)
    
    This endpoint receives already-encrypted files.
    Actual file content analysis happens client-side in zero-knowledge mode.
    """
    try:
        logger.info(f"Receiving encrypted evidence file: {file.filename}")
        
        # Read encrypted file content
        content = await file.read()
        
        # In zero-knowledge architecture:
        # 1. Client encrypts file locally
        # 2. Uploads encrypted file here
        # 3. Server stores encrypted blob (no plaintext access)
        # 4. Client decrypts locally when needed
        
        # For now, return file metadata
        # TODO: Integrate with encrypted storage backend
        
        return {
            "success": True,
            "file": {
                "id": f"evidence_{datetime.utcnow().timestamp()}",
                "filename": file.filename,
                "size": len(content),
                "content_type": file.content_type,
                "uploaded": datetime.utcnow().isoformat(),
                "encrypted": True,
                "case_id": case_id
            },
            "message": "File uploaded successfully (encrypted)"
        }
        
    except Exception as e:
        logger.error(f"Error uploading file: {str(e)}")
        raise HTTPException(status_code=500, detail=f"Upload failed: {str(e)}")

# ============================================
# Error Handlers
# ============================================

@app.exception_handler(HTTPException)
async def http_exception_handler(request, exc):
    """Handle HTTP exceptions"""
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "success": False,
            "error": exc.detail,
            "timestamp": datetime.utcnow().isoformat()
        }
    )

@app.exception_handler(Exception)
async def general_exception_handler(request, exc):
    """Handle general exceptions"""
    logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={
            "success": False,
            "error": "Internal server error",
            "timestamp": datetime.utcnow().isoformat()
        }
    )

# ============================================
# Startup/Shutdown Events
# ============================================

@app.on_event("startup")
async def startup_event():
    """Run on application startup"""
    logger.info("🚀 RettBot+ API starting...")
    logger.info(f"Environment: {os.getenv('ENVIRONMENT', 'development')}")
    logger.info(f"OpenAI configured: {bool(os.getenv('OPENAI_API_KEY'))}")
    logger.info(f"CORS origins: {cors_origins}")
    logger.info("✅ RettBot+ API ready!")

@app.on_event("shutdown")
async def shutdown_event():
    """Run on application shutdown"""
    logger.info("👋 RettBot+ API shutting down...")

# ============================================
# Main Entry Point
# ============================================

if __name__ == "__main__":
    uvicorn.run(
        "main:app",
        host=os.getenv("API_HOST", "0.0.0.0"),
        port=int(os.getenv("API_PORT", 8000)),
        reload=os.getenv("API_RELOAD", "true").lower() == "true",
        log_level=os.getenv("LOG_LEVEL", "info").lower()
    )
