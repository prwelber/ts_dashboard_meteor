Template.registerHelper('numFormat', (num) => {
    // take a number, test with regex looking for specific format, and then
    // insert commas where necessary
    // this should be streamlined at some point
    var num = num.toString();
    var re = /\d{1,}[.]\d\d$/
    var re2 = /\d{1,}$/
    if (re.test(num) == true) {
        if (num.length >= 10) {
            var position = num.search(re);
            num = num.split('');
            num.splice((num.length - 2) - 4, 0, ',');
            num.splice((num.length - 2) - 8, 0, ',');
            num = num.join('');
            return num
        } else if (num.length >= 7) {
            var position = num.search(re);
            num = num.split('');
            num.splice((num.length - 2) - 4, 0, ',');
            num = num.join('');
            return num;
        }
    } else if (num.length >= 7 && re2.test(num) == true) {
        num = num.split('');
        num.splice(num.length - 3, 0, ',');
        num.splice(num.length - 7, 0, ',');
        num = num.join('');
        return num
    } else if (num.length > 3 && re2.test(num) == true) {
        num = num.split('');
        num.splice(num.length - 3, 0, ',');
        num = num.join('');
        return num
    } else {
        console.log('nothing to do here')
    }
})
















