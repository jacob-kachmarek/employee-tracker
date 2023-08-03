const inquirer = require('inquirer');
const mysql = require('mysql2');
const { printTable } = require('console-table-printer');

const db = mysql.createConnection(
    {
        host: 'localhost',
        user: 'root',
        password: 'password',
        database: 'tracker_db'
    }
);

db.connect(() => options());

const questions = [{
    type: "list",
    name: "options",
    message: "What do you want to do?",
    choices: ["View all departments", "View all roles", "View all employees", "Add a department", "Add a role", "Add an employee", "Update an employee role"]
}];


const options = () => {
    inquirer.prompt(questions).then(res => {
        switch (res.options) {
            case "View all departments":
                viewAllDepartments()
                break;
            case "View all roles":
                viewAllRoles()
                break;
            case "View all employees":
                viewAllEmployees()
                break;
            case "Add a department":
                addNewDepartment()
                break;
            case "Add a role":
                addNewRole()
                break;
            case "Add an employee":
                addNewEmployee()
                break;
            case "Update an employee role":
                updateEmployeeRole()
                break;
        }
    })
};