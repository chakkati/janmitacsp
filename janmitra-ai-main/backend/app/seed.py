from app.database import engine, Base, SessionLocal
from app.models import Department, Category, Document, Scheme, EligibilityRule
import uuid

def seed_database():
    print("Initializing database tables...")
    Base.metadata.create_all(bind=engine)
    
    db = SessionLocal()
    try:
        # Check if database is already seeded
        if db.query(Scheme).first():
            print("Database already contains data. Skipping seeding.")
            return

        print("Seeding departments...")
        agri_dept = Department(
            id=str(uuid.uuid4()),
            name="Department of Agriculture, Andhra Pradesh",
            code="AGRI_AP",
            description="Responsible for agricultural production, extension services, and farmer welfare programs.",
            website="https://apagrisnet.gov.in"
        )
        edu_dept = Department(
            id=str(uuid.uuid4()),
            name="Department of Higher & School Education, Andhra Pradesh",
            code="EDU_AP",
            description="Oversees education, schools, universities, and student welfare programs.",
            website="https://apsche.ap.gov.in"
        )
        welfare_dept = Department(
            id=str(uuid.uuid4()),
            name="Department of Social & BC Welfare, Andhra Pradesh",
            code="WELFARE_AP",
            description="Manages pensions, financial assistance, and empowerment schemes for BC/SC/ST communities.",
            website="https://ap.gov.in"
        )
        health_dept = Department(
            id=str(uuid.uuid4()),
            name="Department of Health & Family Welfare, Andhra Pradesh",
            code="HEALTH_AP",
            description="Oversees public health, medical insurance, and free healthcare services.",
            website="https://aarogyasri.ap.gov.in"
        )
        db.add_all([agri_dept, edu_dept, welfare_dept, health_dept])
        db.flush()

        print("Seeding categories...")
        agri_cat = Category(
            id=str(uuid.uuid4()),
            name="Agriculture & Farmers",
            code="AGRI",
            description="Welfare schemes, subsidies, and financial aid for farmers and agrarian workers."
        )
        edu_cat = Category(
            id=str(uuid.uuid4()),
            name="Education & Students",
            code="EDU",
            description="Fee reimbursements, scholarships, laptops, and student welfare initiatives."
        )
        social_cat = Category(
            id=str(uuid.uuid4()),
            name="Social Security & Pension",
            code="PENSION",
            description="Pensions for senior citizens, widows, single women, and persons with disabilities."
        )
        women_cat = Category(
            id=str(uuid.uuid4()),
            name="Women & Financial Empowerment",
            code="WOMEN",
            description="Financial support and self-reliance schemes for women."
        )
        health_cat = Category(
            id=str(uuid.uuid4()),
            name="Healthcare & Insurance",
            code="HEALTH",
            description="Universal healthcare coverage and medical assistance."
        )
        db.add_all([agri_cat, edu_cat, social_cat, women_cat, health_cat])
        db.flush()

        print("Seeding documents...")
        doc_aadhar = Document(
            id=str(uuid.uuid4()),
            name="Aadhaar Card",
            code="AADHAAR",
            description="Primary unique identification document."
        )
        doc_income = Document(
            id=str(uuid.uuid4()),
            name="Income Certificate",
            code="INCOME_CERT",
            description="Official certificate indicating family annual income (valid for current year)."
        )
        doc_caste = Document(
            id=str(uuid.uuid4()),
            name="Caste Certificate",
            code="CASTE_CERT",
            description="Official caste category certification."
        )
        doc_land = Document(
            id=str(uuid.uuid4()),
            name="Land Pattadar Passbook",
            code="LAND_PASSBOOK",
            description="Proof of agricultural land ownership."
        )
        doc_rice = Document(
            id=str(uuid.uuid4()),
            name="Rice Card / Ration Card",
            code="RATION_CARD",
            description="Proof of BPL status and residency."
        )
        db.add_all([doc_aadhar, doc_income, doc_caste, doc_land, doc_rice])
        db.flush()

        print("Seeding schemes and eligibility rules...")
        
        # 1. YSR Rythu Bharosa
        rythu_bharosa = Scheme(
            id=str(uuid.uuid4()),
            name="YSR Rythu Bharosa",
            code="YSR_RB",
            description="Financial assistance program for farmers in Andhra Pradesh, providing financial security and input subsidies.",
            benefits_summary="Financial assistance of ₹13,500 per year per farmer family, distributed in three installments.",
            category_id=agri_cat.id,
            department_id=agri_dept.id,
            official_website="https://ysrrythubharosa.ap.gov.in",
            helpline="1902",
            district_availability=["All"],
            pdf_source_url="https://ysrrythubharosa.ap.gov.in/docs/RythuBharosa_Guidelines.pdf"
        )
        rythu_bharosa.documents.extend([doc_aadhar, doc_income, doc_land])
        db.add(rythu_bharosa)
        db.flush()

        rb_rule1 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=rythu_bharosa.id,
            field_name="is_farmer",
            operator="BOOLEAN",
            rule_value="True",
            error_message="Beneficiary must be registered as an active farmer (is_farmer = True)."
        )
        rb_rule2 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=rythu_bharosa.id,
            field_name="annual_income",
            operator="<=",
            rule_value="250000",
            error_message="Annual family income must be below or equal to ₹2.5 Lakhs."
        )
        db.add_all([rb_rule1, rb_rule2])

        # 2. Jagananna Vidya Deevena
        vidya_deevena = Scheme(
            id=str(uuid.uuid4()),
            name="Jagananna Vidya Deevena",
            code="JVD",
            description="Complete fee reimbursement scheme for students from economically weaker sections pursuing higher education (ITI, Polytechnic, Degree, Engineering, Medicine).",
            benefits_summary="100% college fee reimbursement directly credited to the mother's bank account in quarterly installments.",
            category_id=edu_cat.id,
            department_id=edu_dept.id,
            official_website="https://jnanabhumi.ap.gov.in",
            helpline="1902",
            district_availability=["All"],
            pdf_source_url="https://jnanabhumi.ap.gov.in/docs/VidyaDeevena_Guidelines.pdf"
        )
        vidya_deevena.documents.extend([doc_aadhar, doc_income, doc_caste])
        db.add(vidya_deevena)
        db.flush()

        vd_rule1 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=vidya_deevena.id,
            field_name="occupation",
            operator="=",
            rule_value="Student",
            error_message="Beneficiary must be registered as an active student (occupation = Student)."
        )
        vd_rule2 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=vidya_deevena.id,
            field_name="caste_category",
            operator="IN",
            rule_value='["SC", "ST", "OBC", "EBC"]',
            error_message="Must belong to SC, ST, OBC, or EBC caste categories."
        )
        vd_rule3 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=vidya_deevena.id,
            field_name="annual_income",
            operator="<=",
            rule_value="250000",
            error_message="Annual family income must be below or equal to ₹2.5 Lakhs."
        )
        db.add_all([vd_rule1, vd_rule2, vd_rule3])

        # 3. YSR Pension Kanuka
        pension_kanuka = Scheme(
            id=str(uuid.uuid4()),
            name="YSR Pension Kanuka",
            code="YSR_PK",
            description="Monthly social security pension to vulnerable citizens including senior citizens (60+ years) and persons with disabilities.",
            benefits_summary="Monthly financial assistance of ₹3,000 directly delivered to beneficiaries.",
            category_id=social_cat.id,
            department_id=welfare_dept.id,
            official_website="https://sspensions.ap.gov.in",
            helpline="1902",
            district_availability=["All"],
            pdf_source_url="https://sspensions.ap.gov.in/guidelines"
        )
        pension_kanuka.documents.extend([doc_aadhar, doc_income, doc_rice])
        db.add(pension_kanuka)
        db.flush()

        pk_rule1 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=pension_kanuka.id,
            field_name="age",
            operator=">=",
            rule_value="60",
            error_message="Senior citizen pension requires age >= 60 (or valid disability certificate)."
        )
        pk_rule2 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=pension_kanuka.id,
            field_name="annual_income",
            operator="<=",
            rule_value="120000",
            error_message="Annual family income must be below or equal to ₹1.2 Lakhs."
        )
        db.add_all([pk_rule1, pk_rule2])

        # 4. YSR Cheyutha
        cheyutha = Scheme(
            id=str(uuid.uuid4()),
            name="YSR Cheyutha",
            code="YSR_CH",
            description="Financial support for SC, ST, OBC, and Minority women aged between 45 and 60 to promote sustainable livelihoods.",
            benefits_summary="Financial grant of ₹18,750 per year for 4 years (total ₹75,000).",
            category_id=women_cat.id,
            department_id=welfare_dept.id,
            official_website="https://ap.gov.in",
            helpline="1902",
            district_availability=["All"],
            pdf_source_url="https://ap.gov.in/cheyutha"
        )
        cheyutha.documents.extend([doc_aadhar, doc_income, doc_caste])
        db.add(cheyutha)
        db.flush()

        ch_rule1 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=cheyutha.id,
            field_name="gender",
            operator="=",
            rule_value="Female",
            error_message="Beneficiary must be Female."
        )
        ch_rule2 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=cheyutha.id,
            field_name="age",
            operator=">=",
            rule_value="45",
            error_message="Age must be at least 45 years."
        )
        ch_rule3 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=cheyutha.id,
            field_name="age",
            operator="<=",
            rule_value="60",
            error_message="Age must be 60 years or below."
        )
        ch_rule4 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=cheyutha.id,
            field_name="caste_category",
            operator="IN",
            rule_value='["SC", "ST", "OBC"]',
            error_message="Must belong to SC, ST, or OBC category."
        )
        ch_rule5 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=cheyutha.id,
            field_name="annual_income",
            operator="<=",
            rule_value="250000",
            error_message="Annual family income must be below or equal to ₹2.5 Lakhs."
        )
        db.add_all([ch_rule1, ch_rule2, ch_rule3, ch_rule4, ch_rule5])

        # 5. YSR Aarogyasri
        aarogyasri = Scheme(
            id=str(uuid.uuid4()),
            name="YSR Aarogyasri",
            code="YSR_AS",
            description="Universal health insurance coverage providing free inpatient medical treatment for major procedures and surgeries.",
            benefits_summary="Cashless medical treatment up to ₹5 Lakhs per family per year at empaneled hospitals.",
            category_id=health_cat.id,
            department_id=health_dept.id,
            official_website="https://aarogyasri.ap.gov.in",
            helpline="104",
            district_availability=["All"],
            pdf_source_url="https://aarogyasri.ap.gov.in/procedures"
        )
        aarogyasri.documents.extend([doc_aadhar, doc_rice, doc_income])
        db.add(aarogyasri)
        db.flush()

        as_rule1 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=aarogyasri.id,
            field_name="annual_income",
            operator="<=",
            rule_value="500000",
            error_message="Annual family income must be below or equal to ₹5 Lakhs."
        )
        db.add(as_rule1)

        # 6. Jagananna Amma Vodi
        amma_vodi = Scheme(
            id=str(uuid.uuid4()),
            name="Jagananna Amma Vodi",
            code="JAV",
            description="Financial assistance to mothers/guardians to encourage education of children from Class 1 to 12.",
            benefits_summary="Direct annual financial aid of ₹15,000 credited to the mother's bank account.",
            category_id=edu_cat.id,
            department_id=edu_dept.id,
            official_website="https://jnanabhumi.ap.gov.in",
            helpline="1902",
            district_availability=["All"],
            pdf_source_url="https://jnanabhumi.ap.gov.in/AmmaVodi"
        )
        amma_vodi.documents.extend([doc_aadhar, doc_income, doc_rice])
        db.add(amma_vodi)
        db.flush()

        av_rule1 = EligibilityRule(
            id=str(uuid.uuid4()),
            scheme_id=amma_vodi.id,
            field_name="annual_income",
            operator="<=",
            rule_value="250000",
            error_message="Annual family income must be below or equal to ₹2.5 Lakhs."
        )
        db.add(av_rule1)

        db.commit()
        print("Database seeded successfully with 6 AP welfare schemes!")

    except Exception as e:
        db.rollback()
        print(f"Error seeding database: {e}")
        raise e
    finally:
        db.close()

if __name__ == "__main__":
    seed_database()

