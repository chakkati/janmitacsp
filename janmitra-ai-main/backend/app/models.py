from sqlalchemy import Column, String, Integer, Boolean, ForeignKey, Numeric, DateTime, Text, JSON, Table
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.database import Base

# Junction table for many-to-many relationship between Schemes and Documents
scheme_documents = Table(
    'scheme_documents',
    Base.metadata,
    Column('scheme_id', String(36), ForeignKey('schemes.id', ondelete='CASCADE'), primary_key=True),
    Column('document_id', String(36), ForeignKey('documents.id', ondelete='CASCADE'), primary_key=True),
    Column('is_mandatory', Boolean, default=True)
)

class Department(Base):
    __tablename__ = "departments"

    id = Column(String(36), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String(255), nullable=False, unique=True)
    code = Column(String(50), nullable=False, unique=True)
    description = Column(Text)
    website = Column(String(255))
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    schemes = relationship("Scheme", back_populates="department")

class Category(Base):
    __tablename__ = "categories"

    id = Column(String(36), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String(100), nullable=False, unique=True)
    code = Column(String(50), nullable=False, unique=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    schemes = relationship("Scheme", back_populates="category")

class Profile(Base):
    __tablename__ = "profiles"

    id = Column(String(36), primary_key=True) # Matches auth.users.id
    full_name = Column(String(255))
    phone_number = Column(String(15))
    age = Column(Integer)
    gender = Column(String(20))
    caste_category = Column(String(50)) # General, OBC, SC, ST, EBC, Other
    occupation = Column(String(100)) # Student, Farmer, Job Seeker, etc.
    annual_income = Column(Numeric(12, 2), default=0.00)
    is_disabled = Column(Boolean, default=False)
    disability_percentage = Column(Integer, default=0)
    is_farmer = Column(Boolean, default=False)
    marital_status = Column(String(50))
    district = Column(String(100))
    state = Column(String(100), default="Andhra Pradesh")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

class Scheme(Base):
    __tablename__ = "schemes"

    id = Column(String(36), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String(255), nullable=False, unique=True)
    code = Column(String(100), nullable=False, unique=True)
    description = Column(Text, nullable=False)
    benefits_summary = Column(Text, nullable=False)
    category_id = Column(String(36), ForeignKey('categories.id', ondelete='SET NULL'))
    department_id = Column(String(36), ForeignKey('departments.id', ondelete='SET NULL'))
    official_website = Column(String(255))
    helpline = Column(String(100))
    district_availability = Column(JSON) # Store list of districts or ['All']
    pdf_source_url = Column(String(512))
    last_updated = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    department = relationship("Department", back_populates="schemes")
    category = relationship("Category", back_populates="schemes")
    rules = relationship("EligibilityRule", back_populates="scheme", cascade="all, delete-orphan")
    documents = relationship("Document", secondary=scheme_documents, back_populates="schemes")

class EligibilityRule(Base):
    __tablename__ = "eligibility_rules"

    id = Column(String(36), primary_key=True, server_default=func.gen_random_uuid())
    scheme_id = Column(String(36), ForeignKey('schemes.id', ondelete='CASCADE'), nullable=False)
    field_name = Column(String(100), nullable=False) # e.g. 'age', 'annual_income', etc.
    operator = Column(String(20), nullable=False) # e.g. '>=', '<=', '=', 'IN'
    rule_value = Column(Text, nullable=False) # Store comparison value as string
    error_message = Column(Text)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    scheme = relationship("Scheme", back_populates="rules")

class Document(Base):
    __tablename__ = "documents"

    id = Column(String(36), primary_key=True, server_default=func.gen_random_uuid())
    name = Column(String(255), nullable=False, unique=True)
    code = Column(String(50), nullable=False, unique=True)
    description = Column(Text)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    schemes = relationship("Scheme", secondary=scheme_documents, back_populates="documents")
