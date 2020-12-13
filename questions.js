// Questions    
class PromptQuestion {
    constructor (message, name) {
        this.message = message;
        this.name = name;
    }

    returnString() {
        return JSON.parse(`{"message" : "${this.message}",
        "name" : "${this.name}"}`);
    }
}

// List questions
class ChoiceQuestion extends PromptQuestion {
    constructor (message, name, choices) {
        super(message, name);
        this.type = "list";
        this.choices = choices;
    }

    stringifyChoices() {
        return this.choices.join('","') + '"';
    }

    returnString() {
        return JSON.parse(`{"type" : "list",
        "message" : "${this.message}",
        "name" : "${this.name}",
        "choices" : ["${this.stringifyChoices()}]}`);
    }
}

// Questions to generate
const Questions = {};

Questions.question1 = new ChoiceQuestion("Please choose your action", "action", ["View all employees", "View all employees by department", "View all employees by manager", "Add employee", "Remove employee", "Update employee role", "Update employee manager", "View roles", "Add role", "Remove role", "View departments", "Add department", "Remove department", "View total salary for a department", "Exit"]);
Questions.question2 = new ChoiceQuestion("Choose a department", "department", []);
Questions.question3 = new ChoiceQuestion("Choose a manager", "manager", []);
Questions.question4a = new PromptQuestion("Please enter the employees first name", "firstName");
Questions.question4b = new PromptQuestion("Please enter their last name", "lastName");
Questions.question4c = new ChoiceQuestion("Choose a role", "role", []);
Questions.question4d = Questions.question3;
Questions.question5a = new ChoiceQuestion("Choose an employee to remove", "employee", []);
Questions.question5b = new ChoiceQuestion("Once removed, an employee cannot be retrieved. Please confirm you wish to remove them", "confirmYN", ["Yes", "No"]);
Questions.question6a = new ChoiceQuestion("Please choose an employee whose role will be edited", "employee", []);
Questions.question6b = new ChoiceQuestion("Choose a role", "role", []);
Questions.question7a = new ChoiceQuestion("Choose an employee to edit the mnanager", "employee", []);
Questions.question7b = Questions.question3;
Questions.question8a = new PromptQuestion("Input the new role", "title");
Questions.question8b = new PromptQuestion("Input the new salary (£)", "salary");
Questions.question8c = new ChoiceQuestion("Choose a department for the new role", "department", []);
Questions.question9a = new ChoiceQuestion("Choose a role to remove", "role", []);
Questions.question9b = new ChoiceQuestion("Once removed, a role cannot be retrieved. Please confirm you wish to remove it", "confirmYN", ["Yes", "No"]);
Questions.question10 = new PromptQuestion("Input the new departments name", "name");
Questions.question11a = new ChoiceQuestion("Choose a department to remove", "department", []);
Questions.question11b = new ChoiceQuestion("Once removed, a department cannot be retrieved. Please confirm you wish to remove it", "confirmYN", ["Yes", "No"]);
Questions.question12 = new ChoiceQuestion("Choose a department to view the total salary of", "department", []);

module.exports = {
    Questions : Questions
};