INSERT INTO department (dep_name)
VALUES 
("Sales"),
("Accounting"),
("Data Analysis");

INSERT INTO job_title (title, salary, dep_id)
VALUES
("Accountant", 200000, 2),
("Accounting lead", 300000, 2),
("Sales Rep", 200000, 1),
("Sales Lead", 300000, 1),
("Analyst", 200000, 3),
("Analyst Lead", 300000, 3);

INSERT INTO employee (first_name, last_name, job_title_id, manager_id)
VALUES
("D", "J", 2, null),
("J", "K", 4, null),
("B", "D", 6, null),
("M", "C", 1, 1),
("F", "Y", 1, 1),
("S", "D", 1, 1),
("R", "T", 3, 2),
("U", "O", 3, 2),
("P", "S", 3, 2),
("H", "D", 5, 3),
("T", "W", 5, 3),
("R", "M", 5, 3);