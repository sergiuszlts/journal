class Validator {
    set(element)
    {
        this.element = element;
        this.errors = null;
    }
    minLength(i)
    {
        if(this.element.length < i) this.errors = "Too short"; 
    }
    maxLength(i)
    {
        if(this.element.length > i) this.errors = "Too long"; 
    }
    isEmail()
    {
        if(!(this.element.includes(".") && this.element.includes("@"))) this.errors = "Invalid email";
    }
    passwordEqual(password)
    {
        if(this.element !== password) this.errors = "Password doesn't match";
    }
}


module.exports = Validator;