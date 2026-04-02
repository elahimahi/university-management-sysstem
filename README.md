Project Title: University Management System (UMS) Team Members Roll No Name Email Role 20230104053 Mu Fazle Elahi Mahi fazlemahi250@gmail.com Team Leader 20230104061 Md. Jonayed Bagdadi jonayedbagdadi992@gmail.com Front-end Developer 20230104069 Ashfaq Ahsan ashfaq.cse.20230104069@aust.edu Back-end Developer

Project Overview The University Management System (UMS) is a centralized, web-based academic management platform designed to efficiently manage university-level academic data. The system focuses on handling departments, courses, semesters, students, teachers, enrollments, results, and GPA/CGPA calculations through a structured relational database and modern web technologies. This project aims to reduce data redundancy, ensure data consistency, and automate academic processes that are traditionally manual, time-consuming, and error-prone. Objective • To design and implement a structured relational academic database • To centralize academic data management • To minimize data redundancy and inconsistency • To automate student enrollment, add/drop, and result processing • To provide accurate GPA/CGPA calculation • To apply real-world DBMS, API, and full-stack development concepts

Target Audience • University administration • Academic offices • Teachers and faculty members • Students • IT departments of educational institutions

Tech Stack

Backend • Laravel (PHP)
Frontend • React • HTML, CSS, Tailwind CSS
Rendering Method • Client-Side Rendering (CSR)
Database • Microsoft SQL Server • SSMS (SQL Server Management Studio)
AI Integration • OpenAI / Gemini API
Supporting Tools • JWT: For secure authentication and API communication Key Features  Authentication & Authorization • JWT-based authentication • Role-based access: o Admin o Teacher o Student  Core Functionalities • Department management • Student record maintenance • Teacher record maintenance • Course & semester management • Course offering management • Student enrollment & add/drop • Result processing and GPA & CGPA calculation
 Database Features • Normalized relational schema • Primary & foreign key constraints • Referential integrity enforcement • Stored procedures • Triggers for academic rules • Indexed queries for performance optimization  Exclusive AI Feature • AI-assisted academic performance analysis • Early warning for low GPA students • Automated insights using historical academic data

 API Endpoints (Approximate) Authentication • POST /api/login • POST /api/register • POST /api/logout Departments • GET /api/departments • POST /api/departments • PUT /api/departments/{id} • DELETE /api/departments/{id} Students • GET /api/students • POST /api/students • PUT /api/students/{id} • DELETE /api/students/{id} Teachers • GET /api/teachers • POST /api/teachers Courses & Enrollment • GET /api/courses • POST /api/enroll • POST /api/add-drop Results • POST /api/results • GET /api/gpa/{student_id}

Development Tools & Platforms • Backend: Laravel • Frontend: React.js • DBMS: Microsoft SQL Server • Database Client: SSMS • Documentation: Markdown (README.md) • Version Control: Git & GitHub

Milestones  Milestone 1: Planning & Database Design • Requirement analysis • Database normalization • SQL Server setup • Dummy data insertion  Milestone 2: Backend & API Development • Laravel project setup • Authentication system • REST API development • Stored procedures & triggers • Database integration

Milestone 3: Frontend, AI & Deployment • React UI development • API integration • AI-assisted features • Testing & bug fixing • Deployment & final documentation

Conclusion The University Management System (UMS) is a scalable and practical academic software solution that integrates database design, backend API development, frontend user interfaces, and AI-assisted features. This project demonstrates the application of software engineering principles, DBMS concepts, RESTful architecture, and full-stack development practices in an academic context.
