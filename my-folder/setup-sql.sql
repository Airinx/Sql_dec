DROP TABLE IF EXISTS students;
DROP TABLE IF EXISTS courses;

CREATE TABLE courses (
    course_id VARCHAR(10) PRIMARY KEY,
    course_name VARCHAR(100) NOT NULL,
    faculty_name VARCHAR(100) NOT NULL
);

CREATE TABLE students (
    student_id VARCHAR(10) PRIMARY KEY,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    gender VARCHAR(10),
    gpa DECIMAL(3, 2),
    course_id VARCHAR(10),
    FOREIGN KEY (course_id) REFERENCES courses(course_id)
);

INSERT INTO courses (course_id, course_name, faculty_name) VALUES
('C01', 'Computer Science', 'Faculty of Science'),
('C02', 'Data Analytics', 'Faculty of Science'),
('C03', 'Cybersecurity', 'Faculty of Science'),
('C04', 'Digital Marketing', 'Faculty of Business'),
('C05', 'Finance', 'Faculty of Business'),
('C06', 'Business Management', 'Faculty of Business'),
('C07', 'Graphic Design', 'Faculty of Arts');

INSERT INTO students (student_id, first_name, last_name, gender, gpa, course_id) VALUES
('STU101', 'Alex', 'Smith', 'Male', 3.85, 'C01'),
('STU102', 'Emma', 'Watson', 'Female', 3.42, 'C02'),
('STU103', 'Liam', 'Brown', 'Male', 2.90, 'C04'),
('STU104', 'Sophia', 'Davis', 'Female', 3.65, 'C01'),
('STU105', 'Noah', 'Wilson', 'Male', 2.75, 'C05'),
('STU106', 'Olivia', 'Taylor', 'Female', 3.90, 'C03'),
('STU107', 'Ethan', 'Anderson', 'Male', 3.10, 'C06'),
('STU108', 'Ava', 'Thomas', 'Female', 3.25, 'C07'),
('STU109', 'Lucas', 'White', 'Male', 2.80, 'C02'),
('STU110', 'Isabella', 'Harris', 'Female', 3.55, 'C04');
