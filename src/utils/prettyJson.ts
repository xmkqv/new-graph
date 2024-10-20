const prettyJsonTable = (obj: any) => {
    const keys = Object.keys(obj);
    const values = Object.values(obj);

    let table = "| Key | Value |\n| --- | ----- |\n";
    keys.forEach((key, index) => {
        table += `| ${key} | ${values[index]} |\n`;
    });

    return table;
};

export { prettyJsonTable };
