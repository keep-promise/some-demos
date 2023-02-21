const describeForNameMap = [
    {
        rule: (name) => name.length > 3, // 判断条件
        func: () => console.log("名字太长") // 执行函数
    },
    {
        rule: (name) => name.length < 2, 
        func: () => console.log("名字太短")
    },
    {
        rule: (name) => name[0] === "陈", 
        func: () => console.log("小陈")
    },
    {
        rule: (name) => name === "大鹏", 
        func: () => console.log("管理员")
    },
    {
        rule: (name) => name[0] === "李" && name !== "李鹏",
        func: () => console.log("小李"),
    },
];
