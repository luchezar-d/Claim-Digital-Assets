// Middleware to require a minimum plan level
export const requirePlan = (minPlan) => {
  const planOrder = { free: 0, pro: 1, elite: 2 };
  
  return (req, res, next) => {
    const userPlan = req.user?.plan || 'free';
    const userLevel = planOrder[userPlan];
    const requiredLevel = planOrder[minPlan];
    
    if (userLevel >= requiredLevel) {
      return next();
    }
    
    return res.status(403).json({ 
      error: 'Upgrade required',
      message: `This feature requires a ${minPlan} plan or higher. You currently have: ${userPlan}`,
      currentPlan: userPlan,
      requiredPlan: minPlan
    });
  };
};
