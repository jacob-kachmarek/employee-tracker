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
                addNewRole();
                break;
            case "Add an employee":
                addNewEmployee();
                break;
            case "Update an employee job title":
                updateEmployeeRole();
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