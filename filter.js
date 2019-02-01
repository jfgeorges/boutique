// Supprime les valeurs === value du tableau 'arr'
const arrayRemove = (arr, value) => {
  return arr.filter(ele => {
    return ele !== value;
  });
};

const obj1 = { pipo: 1 };
const obj2 = { molo: 2 };
const obj3 = obj1;
console.log(arrayRemove([obj1, obj2], obj3));
