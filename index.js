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
//Options function that uses inquirer to prompt the user to answer the questions and get a response. Each case will run a function that will fetch data from our database and display it in the console 
function options() {
    //If statement that will close the application if shouldQuit is equal to true. Could also write as if (shouldQuit === true) {}
    if (shouldQuit) {
        console.log("Exiting the application...");
        db.end();
        process.exit();
        return;
    }
    //Switch case that uses inquirer to call of the prompt method to prompt to user the questions from the questions object and runs a different function depending on what the user chooses.
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
//Function that will let the user view the departments table of the db
function viewAllDepartments() {
    db.query("SELECT * FROM department", (err, data) => {
        printTable(data);
        options();
    })
};
//Function that will let the user view the job_title table of the db
function viewAllJobTitles() {
    db.query("SELECT * FROM job_title", (err, data) => {
        printTable(data);
        options();
    })
};
//Function that will let the user view the employee table of the db
function viewAllEmployees() {
    db.query("SELECT * FROM employee", (err, data) => {
        printTable(data);
        options();
    })
};
//Function that will let the user add a new department
function addNewDepartment() {
    inquirer.prompt([{
        type: "input",
        name: "departmentName",
        message: "Add new department",

    }])
        //After user answers inquirer prompt it will take the input of the user (res.departmentName) and insert it into the db using sql command
        .then(res => {
            db.query("INSERT INTO department (dep_name) VALUES (?)", res.departmentName, (err, data) => {
                options()
            })
        })
}

//Function that will let the user add a new job title to the db
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

//Function that will let the user add a new employee to the db

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
//Function that will let the user change an existing employees job
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