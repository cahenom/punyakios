const fs = require('fs');
const src = "C:\\Users\\p\\.gemini\antigravity\\brain\\983a1757-6596-476b-8484-588c2c2455f1\\premium_3d_avatar_1772604436886.png";
const dest = "c:\\Users\\p\\Documents\\project\\PUNYAKIOS\\src\\assets\\images\\user-avatar-3d.png";
fs.copyFileSync(src, dest);
console.log('Copy successful');
