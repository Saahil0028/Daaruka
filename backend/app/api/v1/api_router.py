from fastapi import APIRouter

from app.api.v1 import analytics, auth, health, projects, seed, sites

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(projects.router, prefix="/projects", tags=["projects"])
api_router.include_router(sites.router, prefix="", tags=["sites"]) # includes /sites and /projects/{id}/sites
api_router.include_router(analytics.router, prefix="", tags=["analytics"]) # includes /sites/{id}/analytics and /summary
api_router.include_router(seed.router, prefix="/seed", tags=["seed"])
api_router.include_router(health.router, prefix="/health", tags=["health"])
