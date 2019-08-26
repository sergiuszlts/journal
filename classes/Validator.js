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
}


module.exports = Validator;