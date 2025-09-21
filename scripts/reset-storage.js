const AsyncStorage = require('@react-native-async-storage/async-storage').default;

// ストレージをリセットする関数
async function resetStorage() {
  try {
    console.log('Resetting app storage...');
    
    // すべてのキーを取得
    const keys = await AsyncStorage.getAllKeys();
    console.log('Found keys:', keys);
    
    // 関連するキーを削除
    const keysToRemove = keys.filter(key => 
      key.includes('hydration') || 
      key.includes('expo') ||
      key.includes('userProfile') ||
      key.includes('onboarded')
    );
    
    if (keysToRemove.length > 0) {
      await AsyncStorage.multiRemove(keysToRemove);
      console.log('Removed keys:', keysToRemove);
    } else {
      console.log('No keys to remove');
    }
    
    console.log('Storage reset complete!');
  } catch (error) {
    console.error('Error resetting storage:', error);
  }
}

// 実行
resetStorage();
