const MenuService = require('../../services/menuService');

const menuService = new MenuService();

/**
 * Handles GET /api/staff/menu - Renders the menu management EJS view.
 */
exports.renderMenuManagement = async (req, res) => {
    try {
        // Assuming getFullMenuForManagement() fetches all items for editing
        const menuData = await menuService.getFullMenuForManagement(); 
        
        // Output: Renders an EJS template
        res.render('menuManagement', {
            title: 'Menu Management',
            staff: req.user, 
            menu: menuData
        });
    } catch (error) {
        console.error('Back Office Menu Render Error:', error.message);
        res.status(500).send('<h1>Error loading menu management dashboard.</h1>');
    }
};

/**
 * Handles PUT /api/staff/menu/availability/:productId - Staff Action (JSON)
 */
exports.toggleProductAvailability = async (req, res) => {
    const { productId } = req.params;
    const { isAvailable } = req.body; 

    if (typeof isAvailable !== 'boolean') {
        return res.status(400).json({ message: 'Availability status must be a boolean.' });
    }

    try {
        const updatedProduct = await menuService.toggleProductAvailability(productId, isAvailable);

        // Output: JSON confirmation for the EJS page's AJAX call
        res.status(200).json({
            message: `Product ${updatedProduct.name} availability updated.`,
            isAvailable: updatedProduct.isAvailable
        });
    } catch (error) {
        res.status(404).json({ message: error.message });
    }
};