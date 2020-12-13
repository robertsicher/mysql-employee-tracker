// Required
const inquirer = require("inquirer");
const cTable = require("console.table");
const mysql = require("mysql");
const util = require("util");
const { table, log } = require("console");
const questions = require("./questions");
const Questions = questions.Questions;
const sqlQueries = require("./sql-queries");

let error = "";

// Server connection
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "",
    database: "employeetracker"
})

// Async / Promisify 
const queryAsync = util.promisify(connection.query).bind(connection);

// Create the initial connection, call showAllEmployees function
function startConnection() {
    connection.connect(function(err) {
        if (err) console.error(err);
        console.log("connected as id " + connection.threadId);
        showAllEmployees();
    })
}

// View all function displays all employees from the employees table
async function showAllEmployees() {
    try {
        // Query database to left join role and department tables onto the employee table
        const employeesData = await sqlQueries.employeesDetails();
        
        // Display full list of employees using cTable formatting
        const employeesTable = cTable.getTable(employeesData);
        console.log("\nFull list of employees:\n\n" + employeesTable);

        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - showAllEmployees(): " + error);
    }
}

// User selects an action. Different functions are called depending on the user's selection
async function selectAction() {
    try {
        // What would you like to do?
        const { action } = await inquirer.prompt(Questions.question1.returnString());
        
        // Handle the various cases - do different functions
        switch(action) {
            case Questions.question1.choices[0]:
                showAllEmployees();
                break;
            case Questions.question1.choices[1]:
                sortEmployeeDepartment();
                break;
            case Questions.question1.choices[2]:
                sortEmployeeManager();
                break;
            case Questions.question1.choices[3]:
                addEmployee();
                break;
            case Questions.question1.choices[4]:
                removeEmployee();
                break;
            case Questions.question1.choices[5]:
                updateEmployeeRole();
                break;
            case Questions.question1.choices[6]:
                updateEmployeeManager();
                break;
            case Questions.question1.choices[7]:
                viewRoles();
                break;
            case Questions.question1.choices[8]:
                addRole();
                break;
            case Questions.question1.choices[9]:
                removeRole();
                break;
            case Questions.question1.choices[10]:
                viewDepartments();
                break;
            case Questions.question1.choices[11]:
                addDepartment();
                break;
            case Questions.question1.choices[12]:
                removeDepartment();
                break;
            case Questions.question1.choices[13]:
                viewDepartmentSalary();
                break;
            case Questions.question1.choices[14]:
                exit();
                break;
        }
    }
    catch (error) {
        console.log("ERROR - app.js - selectAction(): " + error);
    }
}

async function sortEmployeeDepartment() {
    try {
        // Query the database for departments names. Use names as question choices
        Questions.question2.choices = await sqlQueries.selectColumn("name", "department");
        
        // Ask the user to select a department
        const { department } = await inquirer.prompt(Questions.question2.returnString());
        
        // Query the database for all employees using the selected department
        const employeesInDepartment = await sqlQueries.employeesInDepartment(department);
        
        // Display list of employees in the selected department using cTable formatting
        const employeesInDepartmentTable = cTable.getTable(employeesInDepartment);
        console.log(`\nList of employees in the ${department} department:\n\n` + employeesInDepartmentTable);
        
        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - sortEmployeeDepartment(): " + error);
    }
}

async function sortEmployeeManager() {
    try {
        // Query the database for managers. Use managers as question choices
        Questions.question3.choices = await sqlQueries.managersList();
        
        // Ask the user to select a manager
        const { manager } = await inquirer.prompt(Questions.question3.returnString());
        
        // Query the database for all employees who work for the selected manager
        const employeesUnderManager = await sqlQueries.employeesUnderManager(manager);
        
        // Display list of employees who work for the selected manager using cTable formatting
        const employeesUnderManagerTable = cTable.getTable(employeesUnderManager);
        console.log(`\nList of employees who work for ${manager}:\n\n` + employeesUnderManagerTable);
        
        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - sortEmployeeManager(): " + error);        
    }
}

async function addEmployee() {
    try {
        // Query the database for roles. Use roles as question choices
        Questions.question4c.choices = await sqlQueries.selectColumn("title", "role");
        
        // Query the database for employees. Use employees as manager choices. Include 'no manager' option
        Questions.question4d.choices = await sqlQueries.employeesList();
        Questions.question4d.choices.push("No manager");
        
        // Prompt the user to input details for new employee: first name, last name, role, manager
        const newEmployee = await inquirer.prompt([Questions.question4a.returnString(), Questions.question4b.returnString(), Questions.question4c.returnString(), Questions.question4d.returnString()]);

        // Query the database to find the corresponding role id
        newEmployee.roleId = await sqlQueries.returnRoleId(newEmployee.role);
        
        // Set the value of managerId property of newEmployee to null if no manager, or managerId otherwise
        if (newEmployee.manager === "No manager") {
            newEmployee.managerId = null;
        }
        else {
            // Query the database to find the corresponding manager id
            newEmployee.managerId = await sqlQueries.returnEmployeeId(newEmployee.manager);
        }
        
        // Assign record values into colValues object
        const colValues = {
            first_name: newEmployee.firstName,
            last_name: newEmployee.lastName,
            role_id: newEmployee.roleId,
            manager_id: newEmployee.managerId
        };
        
        // Insert new entry into the database
        const addEmployee = await sqlQueries.insertRecord("employee", colValues);

        // Display confirmation to state that employee has been added to database
        console.log(`\n${newEmployee.firstName} ${newEmployee.lastName} has been added\n`);

        showAllEmployees();
    }
    catch (error) {
        console.log("ERROR - app.js - addEmployee(): " + error);        
    }
}

async function removeEmployee() {
    try {

        Questions.question5a.choices = await sqlQueries.employeesList();

        const { employee } = await inquirer.prompt(Questions.question5a.returnString());
        
        const { confirmYN } = await inquirer.prompt(Questions.question5b.returnString());

        if (confirmYN === "Yes") {

            const employeeId = await sqlQueries.returnEmployeeId(employee);

            const deleteEmployee = await sqlQueries.deleteRecord("employee", "id", employeeId);

            console.log(`\n${employee} was removed\n`);
        }

        else {
            console.log(`\n${employee} was not removed\n`);
        }

        showAllEmployees();
    }
    catch (error) {
        console.log("ERROR - app.js - removeEmployee(): " + error);
    }
}

async function updateEmployeeRole() {
    try {

        Questions.question6a.choices = await sqlQueries.employeesList();
        
        Questions.question6b.choices = await sqlQueries.selectColumn("title", "role");

        const { employee } = await inquirer.prompt(Questions.question6a.returnString());
        
        const { role } = await inquirer.prompt(Questions.question6b.returnString());
    
        const employeeId = await sqlQueries.returnEmployeeId(employee);
        
        const roleId = await sqlQueries.returnRoleId(role);

        const updateEmployee = await sqlQueries.updateRecord("employee", "role_id", roleId, "id", employeeId);
    
        console.log(`\nThe role of ${employee} was successfully changed to ${role}\n`);

        showAllEmployees();

    }
    catch (error) {
        console.log("ERROR - app.js - updateEmployeeRole(): " + error);
    }
}

async function updateEmployeeManager() {
    try {
        Questions.question7a.choices = await sqlQueries.employeesList();
        Questions.question7b.choices = Questions.question7a.choices;

        const { employee } = await inquirer.prompt(Questions.question7a.returnString());

        const { manager } = await inquirer.prompt(Questions.question7b.returnString());

        const employeeId = await sqlQueries.returnEmployeeId(employee);

        const managerId = await sqlQueries.returnEmployeeId(manager);

        const updateEmployee = await sqlQueries.updateRecord("employee", "manager_id", managerId, "id", employeeId);
    
        console.log(`\n${employee}'s manager was successfully changed to ${manager}\n`);

        showAllEmployees();

    }
    catch (error) {
        console.log("ERROR - app.js - updateEmployeeRole(): " + error);
    }
}

async function viewRoles() {
    try { 

        const rolesDetails = await sqlQueries.rolesDetails();
        
        const rolesDetailsTable = cTable.getTable(rolesDetails);
        console.log(`\nList of all roles:\n\n` + rolesDetailsTable);

        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - viewRoles(): " + error);
    }
}

async function addRole() {
    try {

        Questions.question8c.choices = await sqlQueries.selectColumn("name", "department");

        const newRole = await inquirer.prompt([Questions.question8a.returnString(), Questions.question8b.returnString(), Questions.question8c.returnString()]);

        newRole.departmentId = await sqlQueries.returnDepartmentId(newRole.department);

        const colValues = {
            title: newRole.title,
            salary: newRole.salary,
            department_id: newRole.departmentId
        };
        
        const addRole = await sqlQueries.insertRecord("role", colValues);

        console.log(`\nThe new role of ${newRole.title} was successfully added\n`);

        viewRoles();
    }
    catch (error) {
        console.log("ERROR - app.js - addRole(): " + error);        
    }
}

async function removeRole() {
    try {

        Questions.question9a.choices = await sqlQueries.selectColumn("title", "role");

        const { role } = await inquirer.prompt(Questions.question9a.returnString());
        
        const { confirmYN } = await inquirer.prompt(Questions.question9b.returnString());


        if (confirmYN === "Yes") {

            const roleId = await sqlQueries.returnRoleId(role);

            const deleteRole = await sqlQueries.deleteRecord("role", "id", roleId);            

            console.log(`\nThe role of ${role} was successfully removed\n`);
        }
        
        else {
            console.log(`\nThe role of ${role} was not removed\n`);
        }

        viewRoles();
    }
    catch (error) {
        console.log("ERROR - app.js - removeRole(): " + error);
    }
}

async function viewDepartments() {
    try { 
        const departments = await sqlQueries.selectColumn("name", "department");
        
        const departmentsTable = cTable.getTable(departments);
        console.log(`\nList of all departments:\n\n` + departmentsTable);

        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - viewDepartments(): " + error);
    }
}

async function addDepartment() {
    try {

        const { name } = await inquirer.prompt(Questions.question10.returnString());

        const colValues = {
            name: name
        };

        const addDepartment = await sqlQueries.insertRecord("department", colValues);

        console.log(`\nThe new ${name} department was successfully added\n`);

        viewDepartments();
    }
    catch (error) {
        console.log("ERROR - app.js - addDepartment(): " + error);        
    }
}

async function removeDepartment() {
    try {

        Questions.question11a.choices = await sqlQueries.selectColumn("name", "department");

        const { department } = await inquirer.prompt(Questions.question11a.returnString());
        
        const { confirmYN } = await inquirer.prompt(Questions.question11b.returnString());

        if (confirmYN === "Yes") {

            const departmentId = await sqlQueries.returnDepartmentId(department);
                        
            const deleteDepartment = await sqlQueries.deleteRecord("department", "id", departmentId);

            console.log(`\nThe ${department} department was successfully removed\n`);
        }
        
        else {
            console.log(`\nThe ${department} department was not removed\n`);
        }
        
        viewDepartments();
    }
    catch (error) {
        console.log("ERROR - app.js - removeDepartment(): " + error);
    }
}

async function viewDepartmentSalary() {
    try {

        Questions.question12.choices = await sqlQueries.selectColumn("name", "department");
        
        const { department } = await inquirer.prompt(Questions.question12.returnString());
        
        const departmentId = await sqlQueries.returnDepartmentId(department);
        
        const totalDepartmentSalary = await sqlQueries.totalDepartmentSalary(departmentId);
        
        console.log(`\nThe total salary of the ${department} department is £${totalDepartmentSalary}\n`);

        selectAction();
    }
    catch (error) {
        console.log("ERROR - app.js - viewDepartmentSalary(): " + error);
    }
}

// End the application
function exit() {
    console.log("Ending the application");
    sqlQueries.endConnection();
    connection.end();
}

// Call the startConnection to start the app
startConnection();