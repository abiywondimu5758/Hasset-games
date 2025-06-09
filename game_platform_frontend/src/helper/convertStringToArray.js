export default function convertStringToArray(inputString) {
    const numbersArray = inputString.split(',').map(Number);
    const structuredArray = [];
    for (let i = 0; i < numbersArray.length; i += 5) {
      structuredArray.push(numbersArray.slice(i, i + 5));
    }
  
    return structuredArray;
  }