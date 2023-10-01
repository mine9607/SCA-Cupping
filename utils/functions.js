function sum(a, b) {
  return a + b;
}

// const countrySort = (
//   array.sort(a, b) => {
//     let ca = a.country.toLowerCase(),
//         cb = b.country.toLowerCase();

//     if (ca < cb) {
//       return -1;
//     }
//     if (ca > cb) {
//       return 1;
//     }
//     return 0;
//   }
// );

//sorts coffees array of objects by altitude
function sortCoffees(array, sortVariable, sortOrder = "asc") {
  if (sortOrder === "asc") {
    array.sort((a, b) => {
      return a.sortVariable - b.sortVariable;
    });
  } else {
    array.sort((a, b) => {
      return b.sortVariable - a.sortVariable;
    });
  }

  array.forEach((coffee) => {
    console.log(`${coffee.altitude} ${coffee.country}`);
  });
}

export default sum;
export { sortCoffees };
