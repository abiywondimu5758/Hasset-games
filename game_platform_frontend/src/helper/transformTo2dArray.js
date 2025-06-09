export default function transformTo2DArray(arr) {
    if (arr.length !== 25) {
        throw new Error("Input array must have exactly 25 elements.");
    }

    const result = [];
    for (let i = 0; i < arr.length; i += 5) {
        result.push(arr.slice(i, i + 5));
    }
    return result;
}