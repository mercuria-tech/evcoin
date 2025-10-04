import React, { useState } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  onFilterPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  showFilter?: boolean;
  loading?: boolean;
}

export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  placeholder = 'Search...',
  onFilterPress,
  onFocus,
  onBlur,
  showFilter = true,
  loading = false,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [animatedWidth] = useState(new Animated.Value(showFilter ? 0 : 50));

  const handleFocus = () => {
    setIsFocused(true);
    onFocus?.();
    
    if (showFilter) {
      Animated.timing(animatedWidth, {
        toValue: 50,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleBlur = () => {
    setIsFocused(false);
    onBlur?.();
    
    if (showFilter && !value) {
      Animated.timing(animatedWidth, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  const handleClear = () => {
    onChangeText('');
    
    if (showFilter && !isFocused) {
      Animated.timing(animatedWidth, {
        toValue: 0,
        duration: 200,
        useNativeDriver: false,
      }).start();
    }
  };

  return (
    <View style={styles.container}>
      <View style={[
        styles.searchContainer,
        isFocused && styles.searchContainerFocused
      ]}>
        {/* Search Icon */}
        <Ionicons
          name="search-outline"
          size={20}
          color={isFocused ? '#007AFF' : '#999'}
          style={styles.searchIcon}
        />

        {/* Input Field */}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#999"
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          returnKeyType="search"
          autoCapitalize="none"
          autoCorrect={false}
          clearButtonMode="never"
          underlineColorAndroid="transparent"
        />

        {/* Clear Button */}
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            style={styles.clearButton}
            activeOpacity={0.7}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}

        {/* Loading Indicator */}
        {loading && (
          <Animated.View style={styles.loadingIndicator}>
            <Ionicons name="refresh-outline" size={20} color="#007AFF" />
          </Animated.View>
        )}
      </View>

      {/* Filter Button */}
      {showFilter && (
        <Animated.View style={[styles.filterContainer, { marginLeft: animatedWidth }]}>
          <TouchableOpacity
            style={styles.filterButton}
            onPress={onFilterPress}
            activeOpacity={0.7}
          >
            <Ionicons name="options-outline" size={20} color="#007AFF" />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 12 : 8,
    minHeight: 48,
  },
  searchContainerFocused: {
    borderColor: '#007AFF',
    backgroundColor: '#fff',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  searchIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1a1a1a',
    paddingVertical: Platform.OS === 'ios' ? 4 : 0,
  },
  clearButton: {
    marginLeft: 8,
    padding: 4,
  },
  loadingIndicator: {
    marginLeft: 8,
    padding: 4,
  },
  filterContainer: {
    marginLeft: 12,
    opacity: 1,
  },
  filterButton: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: '#f0f2f5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
});

export default SearchBar;
