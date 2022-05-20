//todo  -   generate unique id
function generateRandomString() {
    let arr = [];
    let ans = '';
    for (let i = 65; i <= 90; i++) {
        arr.push(String.fromCharCode(i));
    };
    for (let i = 97; i <= 122; i++) {
        arr.push(String.fromCharCode(i));
    };
    for (let i = 48; i <= 57; i++) {
        arr.push(String.fromCharCode(i));
    };
    for (let i = 0; i < 6; i++) {
        let charIdx = Math.floor(Math.random() * arr.length);
        ans += arr[charIdx];
    };
    return ans;
};

module.exports = generateRandomString;