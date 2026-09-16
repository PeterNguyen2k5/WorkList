import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  TouchableOpacity,
  SectionList,
  SafeAreaView,
  StatusBar,
  Alert,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

// ============================================
// STUDENT INFORMATION
// ============================================

const STUDENT_ID = "1923050161";

// ---- Suy ra theme & style từ STUDENT_ID (yêu cầu bắt buộc) ----
const BLUE_PALETTE = [
  '#0B1F3A', '#0D2547', '#102B54', '#123161', '#14376E',
  '#173D7B', '#194388', '#1B4995', '#1D4FA2', '#1F55AF',
];
const ACCENT_PALETTE = [
  '#4FC3F7', '#29B6F6', '#03A9F4', '#039BE5', '#0288D1',
  '#0277BD', '#01579B', '#3F51B5', '#5C6BC0', '#7986CB',
];

const idFirstDigit = parseInt(STUDENT_ID[0], 10) || 0;                     // dùng STUDENT_ID #1
const idLastDigit = parseInt(STUDENT_ID[STUDENT_ID.length - 1], 10) || 0;  // dùng STUDENT_ID #2
const THEME_BG = BLUE_PALETTE[idFirstDigit % BLUE_PALETTE.length];          // dùng STUDENT_ID #3
const THEME_ACCENT = ACCENT_PALETTE[idLastDigit % ACCENT_PALETTE.length];   // dùng STUDENT_ID #4
const CARD_RADIUS = 8 + (STUDENT_ID.length % 10);                           // dùng STUDENT_ID #5 (độ dài ID)
const CARD_PADDING = 10 + (idFirstDigit % 5);

// Mức độ ưu tiên 
const PRIORITIES = [
  { key: 'Thấp', color: '#4CAF50' },
  { key: 'Trung bình', color: '#FFC107' },
  { key: 'Cao', color: '#F44336' },
];

// ============================================
// Component: Header
// ============================================
function Header({ total, completed, onClearAll }) {
  return (
    <View style={[styles.header, { backgroundColor: THEME_BG }]}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>📝 Danh Sách Công Việc</Text>
        <View style={[styles.idBadge, { borderColor: THEME_ACCENT }]}>
          <Text style={[styles.idBadgeText, { color: THEME_ACCENT }]}>
            MSSV: {STUDENT_ID}
          </Text>
        </View>
      </View>

      <View style={styles.headerBottomRow}>
        <Text style={styles.headerSubtitle}>
          {completed}/{total} đã hoàn thành
        </Text>
        {total > 0 && (
          <TouchableOpacity onPress={onClearAll} style={styles.clearAllBtn}>
            <Ionicons name="trash-outline" size={14} color="#FFC1C1" />
            <Text style={styles.clearAllText}>Xoá tất cả</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ============================================
// Component: SearchBar
// ============================================
function SearchBar({ query, setQuery }) {
  return (
    <View style={styles.searchSection}>
      <View style={[styles.searchRow, { borderRadius: CARD_RADIUS }]}>
        <Ionicons name="search" size={18} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm công việc..."
          placeholderTextColor="#999"
          value={query}
          onChangeText={setQuery}
        />
        {query.length > 0 && (
          <TouchableOpacity onPress={() => setQuery('')} style={styles.clearSearchBtn}>
            <Ionicons name="close-circle" size={18} color="#bbb" />
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

// ============================================
// Component: FilterTabs
// Bảng phân chia theo từng mục — nhấn vào để chỉ xem mục đó,
// không nhấn (mặc định "Tất cả") sẽ hiện toàn bộ công việc.
// ============================================
function FilterTabs({ activeFilter, setActiveFilter, allCount, incompleteCount, completedCount }) {
  const tabs = [
    { key: 'all', label: 'Tất cả', count: allCount },
    { key: 'incomplete', label: 'Chưa hoàn thành', count: incompleteCount },
    { key: 'completed', label: 'Đã hoàn thành', count: completedCount },
  ];

  return (
    <View style={styles.filterRow}>
      {tabs.map((tab) => {
        const isActive = activeFilter === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[
              styles.filterTab,
              {
                backgroundColor: isActive ? THEME_ACCENT : '#eee',
                borderRadius: CARD_RADIUS,
              },
            ]}
            onPress={() => setActiveFilter(tab.key)}
          >
            <Text
              style={[
                styles.filterTabText,
                { color: isActive ? '#fff' : '#555' },
              ]}
            >
              {tab.label} ({tab.count})
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

// ============================================
// Component: TodoInput (nội dung nhập, dùng lại bên trong bảng thêm việc)
// ============================================
function TodoInput({ text, setText, priority, setPriority, onAdd }) {
  return (
    <View style={styles.inputSection}>
      <View style={styles.inputRow}>
        <TextInput
          style={[styles.textInput, { borderRadius: CARD_RADIUS }]}
          placeholder="Nhập công việc mới..."
          placeholderTextColor="#888"
          value={text}
          onChangeText={setText}
          onSubmitEditing={onAdd}
          autoFocus
        />
        <TouchableOpacity
          style={[styles.addButton, { backgroundColor: THEME_ACCENT, borderRadius: CARD_RADIUS }]}
          onPress={onAdd}
        >
          <Ionicons name="add" size={26} color="#fff" />
        </TouchableOpacity>
      </View>

      <Text style={styles.priorityLabel}>Mức ưu tiên</Text>
      <View style={styles.priorityRow}>
        {PRIORITIES.map((p) => (
          <TouchableOpacity
            key={p.key}
            style={[
              styles.priorityChip,
              {
                backgroundColor: priority === p.key ? p.color : '#eee',
                borderRadius: CARD_RADIUS,
              },
            ]}
            onPress={() => setPriority(p.key)}
          >
            <Text
              style={{
                color: priority === p.key ? '#fff' : '#555',
                fontWeight: '600',
                fontSize: 12,
              }}
            >
              {p.key}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
}

// ============================================
// Component: AddTodoModal
// Bảng riêng (popup) để thêm công việc — mở bằng nút "+" nổi
// ============================================
function AddTodoModal({ visible, onClose, text, setText, priority, setPriority, onAdd }) {
  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={onClose}>
        <TouchableOpacity
          activeOpacity={1}
          onPress={() => {}}
          style={[styles.modalPanel, { borderRadius: CARD_RADIUS }]}
        >
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm công việc mới</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={22} color="#888" />
            </TouchableOpacity>
          </View>

          <TodoInput
            text={text}
            setText={setText}
            priority={priority}
            setPriority={setPriority}
            onAdd={onAdd}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    </Modal>
  );
}

// ============================================
// Component: TodoItem (Card style)
// ============================================
function TodoItem({ item, onToggle, onDelete }) {
  const priorityInfo =
    PRIORITIES.find((p) => p.key === item.priority) || PRIORITIES[0];

  return (
    <View
      style={[
        styles.card,
        {
          borderRadius: CARD_RADIUS,
          padding: CARD_PADDING,
          borderLeftColor: priorityInfo.color,
        },
      ]}
    >
      <TouchableOpacity
        style={styles.checkboxArea}
        onPress={() => onToggle(item.id)}
      >
        <Ionicons
          name={item.completed ? 'checkbox' : 'square-outline'}
          size={24}
          color={item.completed ? THEME_ACCENT : '#999'}
        />
      </TouchableOpacity>

      <View style={styles.cardContent}>
        <Text
          style={[
            styles.cardText,
            item.completed && styles.cardTextDone,
          ]}
        >
          {item.text}
        </Text>
        <View
          style={[
            styles.priorityTag,
            { backgroundColor: priorityInfo.color },
          ]}
        >
          <Text style={styles.priorityTagText}>{item.priority}</Text>
        </View>
      </View>

      <TouchableOpacity onPress={() => onDelete(item.id)} style={styles.deleteBtn}>
        <Ionicons name="trash-outline" size={22} color="#E53935" />
      </TouchableOpacity>
    </View>
  );
}

// ============================================
// Component: TodoList
// Chia 2 khung "Chưa hoàn thành" / "Đã hoàn thành" (có số lượng).
// `filter` quyết định khung nào được hiện: 'all' hiện cả hai,
// còn lại chỉ hiện đúng khung được chọn từ FilterTabs.
// ============================================
function TodoList({ todos, onToggle, onDelete, isSearching, filter }) {
  const incompleteTodos = todos.filter((t) => !t.completed);
  const completedTodos = todos.filter((t) => t.completed);

  const sections = [];
  if ((filter === 'all' || filter === 'incomplete') && incompleteTodos.length > 0) {
    sections.push({
      key: 'incomplete',
      title: 'Chưa hoàn thành',
      count: incompleteTodos.length,
      color: THEME_ACCENT,
      data: incompleteTodos,
    });
  }
  if ((filter === 'all' || filter === 'completed') && completedTodos.length > 0) {
    sections.push({
      key: 'completed',
      title: 'Đã hoàn thành',
      count: completedTodos.length,
      color: '#4CAF50',
      data: completedTodos,
    });
  }

  if (sections.length === 0) {
    let message = 'Chưa có công việc nào. Nhấn nút "+" để thêm!';
    if (isSearching) {
      message = 'Không tìm thấy công việc nào phù hợp.';
    } else if (filter === 'incomplete') {
      message = 'Không có công việc nào chưa hoàn thành.';
    } else if (filter === 'completed') {
      message = 'Chưa có công việc nào hoàn thành.';
    }

    return (
      <View style={styles.emptyState}>
        <Ionicons
          name={isSearching ? 'search-outline' : 'clipboard-outline'}
          size={48}
          color="#ccc"
        />
        <Text style={styles.emptyText}>{message}</Text>
      </View>
    );
  }

  return (
    <SectionList
      sections={sections}
      keyExtractor={(item) => item.id}
      renderItem={({ item }) => (
        <TodoItem item={item} onToggle={onToggle} onDelete={onDelete} />
      )}
      renderSectionHeader={({ section }) => (
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionHeaderTitle}>{section.title}</Text>
          <View
            style={[styles.sectionCountBadge, { backgroundColor: section.color }]}
          >
            <Text style={styles.sectionCountText}>{section.count}</Text>
          </View>
        </View>
      )}
      contentContainerStyle={styles.listContent}
      showsVerticalScrollIndicator={false}
      stickySectionHeadersEnabled={false}
    />
  );
}

// ============================================
// Main App
// ============================================
export default function App() {
  const [todos, setTodos] = useState([
    { id: `${STUDENT_ID}-1`, text: 'Chào mừng đến với Todo App!', completed: false, priority: 'Trung bình' },
    { id: `${STUDENT_ID}-2`, text: 'Nhấn vào ô vuông để đánh dấu hoàn thành', completed: true, priority: 'Thấp' },
  ]);
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState('Trung bình');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'incomplete' | 'completed'
  const [isAddModalVisible, setIsAddModalVisible] = useState(false);

  const handleAdd = () => {
    const trimmed = inputText.trim();
    if (!trimmed) {
      Alert.alert('Trống', 'Vui lòng nhập nội dung trước khi thêm công việc.');
      return;
    }
    const newTodo = {
      id: `${STUDENT_ID}-${Date.now()}`, // dùng STUDENT_ID để tạo id duy nhất
      text: trimmed,
      completed: false,
      priority,
    };
    setTodos((prev) => [newTodo, ...prev]);
    setInputText('');
    setIsAddModalVisible(false);
  };

  const closeAddModal = () => {
    setIsAddModalVisible(false);
    setInputText('');
  };

  const handleToggle = (id) => {
    setTodos((prev) =>
      prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t))
    );
  };

  const handleDelete = (id) => {
    setTodos((prev) => prev.filter((t) => t.id !== id));
  };

  const handleClearAll = () => {
    if (todos.length === 0) return;
    Alert.alert(
      'Xoá tất cả công việc?',
      `Bạn có chắc muốn xoá toàn bộ ${todos.length} công việc? Hành động này không thể hoàn tác.`,
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Xoá tất cả',
          style: 'destructive',
          onPress: () => setTodos([]),
        },
      ]
    );
  };

  const completedCount = todos.filter((t) => t.completed).length;

  // Lọc theo ô tìm kiếm trước, rồi mới tính số lượng cho từng tab
  const searchFilteredTodos = todos.filter((t) =>
    t.text.toLowerCase().includes(searchQuery.trim().toLowerCase())
  );
  const allCount = searchFilteredTodos.length;
  const incompleteCount = searchFilteredTodos.filter((t) => !t.completed).length;
  const completedFilterCount = searchFilteredTodos.filter((t) => t.completed).length;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={THEME_BG} />
      <View style={styles.container}>
        <Header
          total={todos.length}
          completed={completedCount}
          onClearAll={handleClearAll}
        />

        <View style={styles.body}>
          <SearchBar query={searchQuery} setQuery={setSearchQuery} />

          <FilterTabs
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
            allCount={allCount}
            incompleteCount={incompleteCount}
            completedCount={completedFilterCount}
          />

          <TodoList
            todos={searchFilteredTodos}
            onToggle={handleToggle}
            onDelete={handleDelete}
            isSearching={searchQuery.trim().length > 0}
            filter={activeFilter}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>
            MSSV: {STUDENT_ID} · Bài tập 01 · Ứng Dụng Todo
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.fab, { backgroundColor: THEME_ACCENT }]}
          onPress={() => setIsAddModalVisible(true)}
        >
          <Ionicons name="add" size={30} color="#fff" />
        </TouchableOpacity>

        <AddTodoModal
          visible={isAddModalVisible}
          onClose={closeAddModal}
          text={inputText}
          setText={setInputText}
          priority={priority}
          setPriority={setPriority}
          onAdd={handleAdd}
        />
      </View>
    </SafeAreaView>
  );
}

// ============================================
// Styles
// ============================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#F4F6FA',
  },
  container: {
    flex: 1,
    flexDirection: 'column',
  },
  header: {
    paddingTop: 16,
    paddingBottom: 14,
    paddingHorizontal: 18,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#fff',
  },
  idBadge: {
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  idBadgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  headerBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
  },
  headerSubtitle: {
    color: '#cfd8ea',
    fontSize: 13,
  },
  clearAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  clearAllText: {
    color: '#FFC1C1',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  body: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 14,
  },
  inputSection: {
    marginTop: 4,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 15,
    marginRight: 8,
  },
  addButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  priorityLabel: {
    fontSize: 12,
    color: '#888',
    marginTop: 12,
    marginBottom: 6,
  },
  priorityRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
  },
  priorityChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
  },
  searchSection: {
    marginBottom: 10,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#ddd',
    paddingHorizontal: 12,
  },
  searchIcon: {
    marginRight: 6,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 14,
  },
  clearSearchBtn: {
    marginLeft: 6,
    padding: 2,
  },
  filterRow: {
    flexDirection: 'row',
    justifyContent: 'flex-start',
    marginBottom: 10,
  },
  filterTab: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginRight: 8,
  },
  filterTabText: {
    fontSize: 12,
    fontWeight: '600',
  },
  listContent: {
    paddingBottom: 90,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 2,
    marginTop: 6,
  },
  sectionHeaderTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: '#555',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  sectionCountBadge: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 6,
  },
  sectionCountText: {
    color: '#fff',
    fontSize: 11,
    fontWeight: '700',
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginBottom: 10,
    borderLeftWidth: 5,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  checkboxArea: {
    marginRight: 10,
  },
  cardContent: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cardText: {
    fontSize: 15,
    color: '#222',
    flexShrink: 1,
    marginRight: 8,
  },
  cardTextDone: {
    textDecorationLine: 'line-through',
    color: '#999',
  },
  priorityTag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  priorityTagText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  deleteBtn: {
    marginLeft: 10,
    padding: 4,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 60,
  },
  emptyText: {
    color: '#aaa',
    marginTop: 10,
    fontSize: 14,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  footer: {
    paddingVertical: 10,
    alignItems: 'center',
    backgroundColor: '#EDEFF4',
  },
  footerText: {
    fontSize: 11,
    color: '#888',
  },
  fab: {
    position: 'absolute',
    right: 20,
    bottom: 76,
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.25,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 5,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
  },
  modalPanel: {
    width: '100%',
    backgroundColor: '#fff',
    padding: 18,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
  },
});