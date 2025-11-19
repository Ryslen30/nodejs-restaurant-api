exports.showDashboard = (req, res) => {
  const orders = [
    {
      id: 101,
      table: { number: 3 },
      waiter: { name: "Ahmed" },
      items: [
        { productName: "Pizza Margherita", quantity: 2 },
        { productName: "Coca-Cola", quantity: 1 }
      ],
      status: "confirmed"
    },
    {
      id: 102,
      table: { number: 1 },
      waiter: { name: "Sara" },
      items: [{ productName: "Pasta Carbonara", quantity: 1 }],
      status: "preparing"
    }
  ];

  res.render("kitchen/dashboard", { orders });
};
