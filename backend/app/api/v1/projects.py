from typing import List, Optional
from uuid import UUID
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.api.deps import get_db, get_current_user
from app.models.user import User
from app.models.project import Project
from app.models.site import Site
from app.schemas.project import ProjectCreate, ProjectUpdate, ProjectResponse

router = APIRouter()

def build_project_response(project: Project, db: Session) -> ProjectResponse:
    # Calculate sites count and total mapped area for this project
    sites = db.query(Site).filter(Site.project_id == project.id).all()
    sites_count = len(sites)
    total_area = sum(s.area_sq_km for s in sites) if sites else 0.0

    res = ProjectResponse.model_validate(project)
    res.sites_count = sites_count
    res.total_area_sq_km = round(total_area, 4)
    return res

@router.get("", response_model=List[ProjectResponse])
def list_projects(
    search: Optional[str] = Query(None, description="Search by name or region"),
    category: Optional[str] = Query(None, description="Filter by project category"),
    status: Optional[str] = Query(None, description="Filter by status"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """List all projects owned by the authenticated user."""
    query = db.query(Project).filter(Project.owner_id == current_user.id)
    
    if search:
        pattern = f"%{search}%"
        query = query.filter((Project.name.ilike(pattern)) | (Project.region.ilike(pattern)))
    if category:
        query = query.filter(Project.category == category)
    if status:
        query = query.filter(Project.status == status)

    projects = query.order_by(Project.created_at.desc()).all()
    return [build_project_response(p, db) for p in projects]

@router.post("", response_model=ProjectResponse, status_code=status.HTTP_201_CREATED)
def create_project(
    project_in: ProjectCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Create a new project owned by current user."""
    project = Project(
        owner_id=current_user.id,
        name=project_in.name,
        description=project_in.description,
        category=project_in.category,
        region=project_in.region,
        status=project_in.status,
        start_date=project_in.start_date,
        end_date=project_in.end_date
    )
    db.add(project)
    db.commit()
    db.refresh(project)
    return build_project_response(project, db)

@router.get("/{project_id}", response_model=ProjectResponse)
def get_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get project details if owned by current user."""
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )
    return build_project_response(project, db)

@router.put("/{project_id}", response_model=ProjectResponse)
def update_project(
    project_id: UUID,
    project_in: ProjectUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update project if owned by current user."""
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )

    update_data = project_in.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(project, field, value)

    db.commit()
    db.refresh(project)
    return build_project_response(project, db)

@router.delete("/{project_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_project(
    project_id: UUID,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete project and cascade delete all associated sites & analytics."""
    project = db.query(Project).filter(Project.id == project_id, Project.owner_id == current_user.id).first()
    if not project:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Project not found or access denied"
        )

    db.delete(project)
    db.commit()
    return None
