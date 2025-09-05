import './src/lib/db.js';
import Cart from './src/models/Cart.js';

async function checkCartContents() {
  try {
    console.log('🔍 Checking cart: 68b8e4f74e5eabe010b6e80e');
    
    const cart = await Cart.findById('68b8e4f74e5eabe010b6e80e').populate('items.productId');
    
    if (!cart) {
      console.log('❌ Cart not found');
      return;
    }
    
    console.log('✅ Cart found:', {
      id: cart._id.toString(),
      status: cart.status,
      itemsCount: cart.items.length,
      createdAt: cart.createdAt
    });
    
    console.log('📦 Cart items:');
    cart.items.forEach((item, i) => {
      console.log(`  ${i+1}. Product: ${item.productId ? item.productId.slug : 'NULL'} x${item.quantity}`);
      if (item.productId) {
        console.log(`     Product ID: ${item.productId._id}`);
        console.log(`     Product Name: ${item.productId.name}`);
      }
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    process.exit(0);
  }
}

checkCartContents();
