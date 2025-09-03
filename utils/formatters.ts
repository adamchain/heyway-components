// Helper function to format service type with proper article
export const formatServiceType = (serviceType: string): string => {
  const lowerService = serviceType.toLowerCase().trim();

  // Handle specific cases
  if (lowerService === 'mens' || lowerService === 'men') {
    return "a men's haircut";
  }
  if (lowerService === 'womens' || lowerService === 'women') {
    return "a women's haircut";
  }
  if (lowerService === 'haircut') {
    return "a haircut";
  }
  if (lowerService.includes('haircut') && !lowerService.startsWith('a ') && !lowerService.startsWith('an ')) {
    return `a ${serviceType}`;
  }

  // Check if service already has an article
  if (lowerService.startsWith('a ') || lowerService.startsWith('an ') || lowerService.startsWith('the ')) {
    return serviceType;
  }

  // Add appropriate article based on vowel sound
  const vowelStart = /^[aeiou]/i.test(lowerService);
  return vowelStart ? `an ${serviceType}` : `a ${serviceType}`;
};

// Helper function to format order items with proper grammar
export const formatOrderItem = (item: { name: string; quantity?: string }): string => {
  const quantity = item.quantity && item.quantity !== '1' ? parseInt(item.quantity) : 1;
  const itemName = item.name.trim();

  if (quantity === 1) {
    // Single item - add article if needed
    const lowerItem = itemName.toLowerCase();
    if (lowerItem.startsWith('a ') || lowerItem.startsWith('an ') || lowerItem.startsWith('the ')) {
      return itemName;
    }
    const vowelStart = /^[aeiou]/i.test(lowerItem);
    return vowelStart ? `an ${itemName}` : `a ${itemName}`;
  } else {
    // Multiple items - handle pluralization
    let pluralName = itemName;
    const lowerItem = itemName.toLowerCase();

    // Basic pluralization rules
    if (!lowerItem.endsWith('s') && !lowerItem.endsWith('x') && !lowerItem.endsWith('z') &&
      !lowerItem.endsWith('ch') && !lowerItem.endsWith('sh')) {
      if (lowerItem.endsWith('y') && !/[aeiou]y$/.test(lowerItem)) {
        pluralName = itemName.slice(0, -1) + 'ies';
      } else {
        pluralName = itemName + 's';
      }
    } else if (lowerItem.endsWith('s') || lowerItem.endsWith('x') || lowerItem.endsWith('z') ||
      lowerItem.endsWith('ch') || lowerItem.endsWith('sh')) {
      pluralName = itemName + 'es';
    }

    return `${quantity} ${pluralName}`;
  }
};