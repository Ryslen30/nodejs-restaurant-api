// const MenuService = require('../../services/menuService');

// const menuService = new MenuService();

// /**
//  * Handles GET /api/client/menu
//  * Retrieves the complete filtered menu for the Flutter app. (JSON)
//  */
// exports.getMenu = async (req, res) => {
//     try {
//         // Service provides the pure, structured data
//         const menuData = await menuService.getFullActiveMenu();

//         // Output: JSON data for the Front Office
//         res.status(200).json({  
//             success: true, 
//             menu: menuData 
//         });
//     } catch (error) {
//         console.error('Front Office Menu Error:', error.message);
//         res.status(500).json({ message: 'Could not retrieve menu data.' });
//     }
// };