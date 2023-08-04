const inquirer = require('inquirer');
const mysql = require('mysql2');
const { printTable } = require('console-table-printer');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'employee_db'
    }
);

db.connect(() => options());

const questions = [{
    type: "list",
    name: "options",
    message: "What do you want to do?",
    choices: ["View all departments", "View all job titles", "View all employees", "Add a department", "Add a job title", "Add an employee", "Update an employee job title", "Quit"],
}];

let shouldQuit = false;

function options() {

    if (shouldQuit) {
        console.log("Exiting the application...");
        db.end();
        process.exit();
        return;
    }

    inquirer.prompt(questions).then(res => {
        switch (res.options) {
            case "View all departments":
                viewAllDepartments();
                break;
            case "View all job titles":
                viewAllJobTitles();
                break;
            case "View all employees":
                viewAllEmployees();
                break;
            case "Add a department":
                addNewDepartment();
                break;
            case "Add a job title":
                addNewJobTitle();
                break;
            case "Add an employee":
                addNewEmployee();
                break;
            case "Update an employee job title":
                updateEmployeeJob();
                break;
            case "Quit":
                shouldQuit = true;
                options();
                break;
            default:
                options();
        }
    })
};

function viewAllDepartments() {
    db.query("SELECT * FROM department", (err, data) => {
        printTable(data);
        options();
    })
};

function viewAllJobTitles() {
    db.query("SELECT * FROM job_title", (err, data) => {
        printTable(data);
        options();
    })
};

function viewAllEmployees() {
    db.query("SELECT * FROM employee", (err, data) => {
        printTable(data);
        options();
    })
};

function addNewDepartment() {
    inquirer.prompt([{
        type: "input",
        name: "departmentName",
        message: "Add new department",

    }])
        .then(res => {
            db.query("INSERT INTO department (dep_name) VALUES (?)", res.departmentName, (err, data) => {
                options()
            })
        })
}


function addNewJobTitle() {

    db.query("SELECT * FROM department", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const departmentChoices = data.map((department) => department.dep_name);
        inquirer.prompt([
            {
                type: "input",
                name: "newJobTitle",
                message: "New job title",
            },
            {
                type: "input",
                name: "salary",
                message: "Salary?",
            },
            {
                type: "list",
                name: "jobToDepartments",
                message: "Department?",
                choices: departmentChoices,
            },
        ])
            .then(res => {
                const { newJobTitle, salary, jobToDepartments } = res;
                db.query("INSERT INTO job_title (title, salary, dep_id) VALUES (?, ?, (SELECT id FROM department WHERE dep_name = ?))",
                    [newJobTitle, salary, jobToDepartments],
                    (err, data) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log("New role added successfully!");
                        }
                        options();
                    }
                );
            });
    });
};



function addNewEmployee() {
    db.query("SELECT * FROM job_title", (err, data) => {
        if (err) {
            console.error(err);
            return;
        }
        const jobTitleChoices = data.map((job_title) => ({
            name: job_title.title,
            value: job_title.id
        }));
        inquirer.prompt([
            {
                type: "input",
                name: "firstName",
                message: "first Name",
            },
            {
                type: "input",
                name: "lastName",
                message: "Last nNme",
            },
            {
                type: "list",
                name: "jobTitleID",
                message: "Job Title",
                choices: jobTitleChoices,
            },
            {
                type: "input",
                name: "managerId",
                message: "Manager ID",
            }
        ])
            .then(res => {
                const { firstName, lastName, jobTitleID, managerId } = res;

                db.query(
                    "INSERT INTO employee (first_name, last_name, job_title_id, manager_id) VALUES (?, ?, ?, ?)",
                    [firstName, lastName, jobTitleID, managerId || null],
                    (err, data) => {
                        if (err) {
                            console.error(err);
                        } else {
                            console.log("Employee added");
                        }
                        options();
                    }
                );
            });
    });
};

function updateEmployeeJob() {
    db.query("SELECT * FROM employee", (err, employeeData) => {
        if (err) {
            console.error(err);
            return;
        }

        db.query("SELECT * FROM job_title", (err, jobData) => {
            if (err) {
                console.error(err);
                return;
            }

            const employeeChoices = employeeData.map((employee) => ({
                name: `${employee.first_name} ${employee.last_name}`,
                value: employee.id,
            }));

            const jobChoices = jobData.map((job) => ({
                name: job.title,
                value: job.id,
            }));

            inquirer.prompt([
                {
                    type: "list",
                    name: "employeeId",
                    message: "Select employee to update",
                    choices: employeeChoices,
                },
                {
                    type: "list",
                    name: "jobId",
                    message: "Select new job for employee",
                    choices: jobChoices,
                },
            ])
                .then(res => {
                    const { jobId, employeeId } = res;

                    db.query(
                        "UPDATE employee SET job_title_id = ? WHERE id = ?",
                        [jobId, employeeId],
                        (err, data) => {
                            if (err) {
                                console.error(err);
                            } else {
                                console.log("Employee role updated");
                            }
                            options();
                        }
                    );
                });
        });
    });
};