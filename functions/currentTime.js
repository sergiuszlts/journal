function currentTime()
{
    let date = new Date();
    return date.toLocaleDateString()+" "+date.toLocaleTimeString();
}


module.exports = currentTime;