const getRandomCode = () => {
  let code = "";
  for (let i = 0; i < 4; i++) {
    const a = String.fromCharCode(97 + Math.floor(Math.random() * 26));
    code += a;
  }
  return code;
};

const isExpired = time => {
  const currentTime = Date.now();
  const expiryduration = 15 * 60 * 1000;

  if (currentTime - parseInt(time) >= expiryduration) {
    return true;
  }
  return false;
};

const getfilename = filename => {
  const fn = filename.substring(0, filename.length - 4);
  return `${fn}_${Date.now()}`;
};
module.exports = {
  getRandomCode,
  isExpired,
  getfilename
};
