let currentPage = 1;
let itemsPerPage = 10;
let currentSort = { column: null, direction: 'asc' };
let currentFilters = {};
let currentSearchTerm = '';

function showNotification(message, type = 'info') {
    const container = document.getElementById('notification-container');
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.innerHTML = `
        <span>${message}</span>
        <button class="notification-close" onclick="this.parentElement.remove()">×</button>
    `;
    container.appendChild(notification);
    
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

function openModal(title, bodyHTML, onSubmit) {
    const modal = document.getElementById('modal-overlay');
    document.getElementById('modal-title').textContent = title;
    document.getElementById('modal-body').innerHTML = bodyHTML;
    modal.style.display = 'flex';
    
    const submitBtn = document.getElementById('modal-submit');
    submitBtn.onclick = onSubmit;
}

function closeModal() {
    document.getElementById('modal-overlay').style.display = 'none';
}

function confirm(message, onConfirm) {
    const dialog = document.getElementById('confirm-dialog');
    document.getElementById('confirm-message').textContent = message;
    dialog.style.display = 'flex';
    
    document.getElementById('confirm-yes').onclick = () => {
        onConfirm();
        closeConfirm();
    };
}

function closeConfirm() {
    document.getElementById('confirm-dialog').style.display = 'none';
}

function filterData(data, filters, searchTerm) {
    let filtered = [...data];
    
    if (searchTerm) {
        filtered = filtered.filter(item => {
            return Object.values(item).some(value => 
                String(value).toLowerCase().includes(searchTerm.toLowerCase())
            );
        });
    }
    
    Object.keys(filters).forEach(key => {
        if (filters[key]) {
            filtered = filtered.filter(item => item[key] === filters[key]);
        }
    });
    
    return filtered;
}

function sortData(data, column, direction) {
    if (!column) return data;
    
    return [...data].sort((a, b) => {
        let aVal = a[column];
        let bVal = b[column];
        
        if (typeof aVal === 'string') {
            aVal = aVal.toLowerCase();
            bVal = bVal.toLowerCase();
        }
        
        if (aVal < bVal) return direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return direction === 'asc' ? 1 : -1;
        return 0;
    });
}

function paginateData(data, page, perPage) {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return data.slice(start, end);
}

function createPagination(totalItems, currentPage, itemsPerPage, onPageChange) {
    const totalPages = Math.ceil(totalItems / itemsPerPage);
    
    if (totalPages <= 1) return '';
    
    let html = '<div class="pagination">';
    
    html += `<button class="pagination-button" ${currentPage === 1 ? 'disabled' : ''} onclick="${onPageChange}(${currentPage - 1})">前へ</button>`;
    
    for (let i = 1; i <= totalPages; i++) {
        if (i === 1 || i === totalPages || (i >= currentPage - 1 && i <= currentPage + 1)) {
            html += `<button class="pagination-button ${i === currentPage ? 'active' : ''}" onclick="${onPageChange}(${i})">${i}</button>`;
        } else if (i === currentPage - 2 || i === currentPage + 2) {
            html += '<span>...</span>';
        }
    }
    
    html += `<button class="pagination-button" ${currentPage === totalPages ? 'disabled' : ''} onclick="${onPageChange}(${currentPage + 1})">次へ</button>`;
    
    html += `<span class="pagination-info">${totalItems}件中 ${(currentPage - 1) * itemsPerPage + 1}-${Math.min(currentPage * itemsPerPage, totalItems)}件表示</span>`;
    html += '</div>';
    
    return html;
}

function exportToCSV(data, filename) {
    if (!data || data.length === 0) {
        showNotification('エクスポートするデータがありません', 'warning');
        return;
    }
    
    const headers = Object.keys(data[0]);
    const csv = [
        headers.join(','),
        ...data.map(row => headers.map(header => {
            const value = row[header];
            return typeof value === 'string' && value.includes(',') ? `"${value}"` : value;
        }).join(','))
    ].join('\n');
    
    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
    
    showNotification('データをエクスポートしました', 'success');
}

const mockData = {
    menuItems: [
        { id: 1, name: 'ビッグマック', nameEn: 'Big Mac', price: 450, category: 'バーガー', calories: 525, image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?w=400&h=300&fit=crop' },
        { id: 2, name: '倍ビッグマック', nameEn: 'Double Big Mac', price: 650, category: 'バーガー', calories: 742, image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=300&fit=crop' },
        { id: 3, name: 'チーズバーガー', nameEn: 'Cheeseburger', price: 150, category: 'バーガー', calories: 307, image: 'https://images.unsplash.com/photo-1551782450-17144efb9c50?w=400&h=300&fit=crop' },
        { id: 4, name: 'ダブルチーズバーガー', nameEn: 'Double Cheeseburger', price: 380, category: 'バーガー', calories: 463, image: 'https://images.unsplash.com/photo-1606755962773-d324e0a13086?w=400&h=300&fit=crop' },
        { id: 5, name: 'てりやきマックバーガー', nameEn: 'Teriyaki McBurger', price: 380, category: 'バーガー', calories: 478, image: 'https://images.unsplash.com/photo-1603064752734-4c48eff53d05?w=400&h=300&fit=crop' },
        { id: 6, name: '倍てりやきマックバーガー', nameEn: 'Double Teriyaki McBurger', price: 530, category: 'バーガー', calories: 656, image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=400&h=300&fit=crop' },
        { id: 7, name: 'チーズダブルてりやき', nameEn: 'Cheese Double Teriyaki', price: 580, category: 'バーガー', calories: 712, image: 'https://www.mcdonalds.co.jp/product_images/3362/1597.m.webp?20260114100120' },
        { id: 8, name: 'フィレオフィッシュ', nameEn: 'Filet-O-Fish', price: 390, category: 'バーガー', calories: 336, image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=400&h=300&fit=crop' },
        { id: 9, name: 'てりやきチキンフィレオ', nameEn: 'Teriyaki Chicken Filet', price: 420, category: 'バーガー', calories: 496, image: 'https://images.unsplash.com/photo-1561758033-d89a9ad46330?w=400&h=300&fit=crop' },
        { id: 10, name: 'ホットチリ&タルタルチキン', nameEn: 'Hot Chili & Tartar Chicken', price: 520, category: 'バーガー', calories: 538, image: 'https://www.mcdonalds.co.jp/product_images/3361/1596.m.webp?20260114100104' },
        { id: 11, name: 'ドラクエバーガー', nameEn: 'Dragon Quest Burger', price: 580, category: 'バーガー', calories: 612, image: 'https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?w=400&h=300&fit=crop' },
        { id: 12, name: 'マックグリドル ソーセージエッグ', nameEn: 'McGriddles Sausage Egg', price: 370, category: '朝マック', calories: 551, image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&h=300&fit=crop' },
        { id: 13, name: 'ソーセージエッグマフィン', nameEn: 'Sausage Egg Muffin', price: 250, category: '朝マック', calories: 487, image: 'https://images.unsplash.com/photo-1621852004158-f3bc188ace2d?w=400&h=300&fit=crop' },
        { id: 14, name: 'ソーセージマフィン', nameEn: 'Sausage Muffin', price: 120, category: '朝マック', calories: 391, image: 'https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=400&h=300&fit=crop' },
        { id: 15, name: 'エッグマックマフィン', nameEn: 'Egg McMuffin', price: 230, category: '朝マック', calories: 310, image: 'https://images.unsplash.com/photo-1619096252214-ef06c45683e3?w=400&h=300&fit=crop' },
        { id: 16, name: 'マックフライポテト(S)', nameEn: 'French Fries S', price: 180, category: 'サイド', calories: 225, image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?w=400&h=300&fit=crop' },
        { id: 17, name: 'マックフライポテト(M)', nameEn: 'French Fries M', price: 290, category: 'サイド', calories: 424, image: 'https://images.unsplash.com/photo-1630384060421-cb20d0e0649d?w=400&h=300&fit=crop' },
        { id: 18, name: 'マックフライポテト(L)', nameEn: 'French Fries L', price: 340, category: 'サイド', calories: 571, image: 'https://images.unsplash.com/photo-1598679253544-2c97992403ea?w=400&h=300&fit=crop' },
        { id: 19, name: 'シャカシャカポテト ハッピーターン味', nameEn: 'Shaka Shaka Potato Happy Turn', price: 330, category: 'サイド', calories: 456, image: 'https://images.unsplash.com/photo-1639024471283-03518883512d?w=400&h=300&fit=crop' },
        { id: 20, name: 'チキンマックナゲット 5ピース', nameEn: 'Chicken McNuggets 5pc', price: 250, category: 'サイド', calories: 270, image: 'https://images.unsplash.com/photo-1562967914-608f82629710?w=400&h=300&fit=crop' },
        { id: 21, name: 'スパイシーチキンマックナゲット 黒胡椒ガーリック', nameEn: 'Spicy Chicken McNuggets', price: 280, category: 'サイド', calories: 285, image: 'https://www.mcdonalds.co.jp/product_images/3378/1688.m.webp?20260109135914' },
        { id: 22, name: 'えびフィレオ', nameEn: 'Ebi Filet-O', price: 390, category: 'サイド', calories: 395, image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641?w=400&h=300&fit=crop' },
        { id: 23, name: 'コカ・コーラ(S)', nameEn: 'Coca-Cola S', price: 130, category: 'ドリンク', calories: 90, image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400&h=300&fit=crop' },
        { id: 24, name: 'コカ・コーラ(M)', nameEn: 'Coca-Cola M', price: 190, category: 'ドリンク', calories: 140, image: 'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?w=400&h=300&fit=crop' },
        { id: 25, name: 'コカ・コーラ(L)', nameEn: 'Coca-Cola L', price: 230, category: 'ドリンク', calories: 192, image: 'https://images.unsplash.com/photo-1629203851122-3726ecdf080e?w=400&h=300&fit=crop' },
        { id: 26, name: 'アイスコーヒー(M)', nameEn: 'Iced Coffee M', price: 150, category: 'ドリンク', calories: 10, image: 'https://images.unsplash.com/photo-1517487881594-2787fef5ebf7?w=400&h=300&fit=crop' },
        { id: 27, name: 'マックシェイク バニラ', nameEn: 'McShake Vanilla', price: 150, category: 'ドリンク', calories: 213, image: 'https://images.unsplash.com/photo-1572490122747-3968b75cc699?w=400&h=300&fit=crop' },
        { id: 28, name: 'マックシェイク チョコ', nameEn: 'McShake Chocolate', price: 150, category: 'ドリンク', calories: 228, image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?w=400&h=300&fit=crop' },
        { id: 29, name: '生チョコクリームパイ', nameEn: 'Raw Chocolate Cream Pie', price: 180, category: 'スイーツ', calories: 312, image: 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400&h=300&fit=crop' },
        { id: 30, name: '塩キャラメルアーモンドパイ', nameEn: 'Salted Caramel Almond Pie', price: 180, category: 'スイーツ', calories: 298, image: 'https://images.unsplash.com/photo-1535920527002-b35e96722eb9?w=400&h=300&fit=crop' },
        { id: 31, name: 'マックフルーリー きのこの山とたけのこの里', nameEn: 'McFlurry Kinoko & Takenoko', price: 340, category: 'スイーツ', calories: 425, image: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?w=400&h=300&fit=crop' },
        { id: 32, name: 'ソフトツイスト', nameEn: 'Soft Twist', price: 150, category: 'スイーツ', calories: 228, image: 'https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&h=300&fit=crop' }
    ],
    orders: [
        { id: 'ORD-001', user: '山田太郎', type: 'モバイルオーダー', status: '調理中', total: 890, time: '14:30' },
        { id: 'ORD-002', user: '佐藤花子', type: 'デリバリー', status: '配達中', total: 1240, time: '14:25' },
        { id: 'ORD-003', user: '鈴木一郎', type: 'お持ち帰り', status: '準備完了', total: 650, time: '14:20' },
        { id: 'ORD-004', user: '田中美咲', type: 'モバイルオーダー', status: '確認済み', total: 1580, time: '14:35' },
        { id: 'ORD-005', user: '高橋健太', type: 'デリバリー', status: '調理中', total: 2100, time: '14:32' },
        { id: 'ORD-006', user: '伊藤美香', type: 'モバイルオーダー', status: '準備完了', total: 780, time: '14:15' },
        { id: 'ORD-007', user: '渡辺健', type: 'お持ち帰り', status: '調理中', total: 1450, time: '14:38' },
        { id: 'ORD-008', user: '中村さくら', type: 'デリバリー', status: '配達中', total: 920, time: '14:10' },
        { id: 'ORD-009', user: '小林優太', type: 'モバイルオーダー', status: '完了', total: 1680, time: '13:55' },
        { id: 'ORD-010', user: '加藤愛', type: 'お持ち帰り', status: '確認済み', total: 550, time: '14:40' },
        { id: 'ORD-011', user: '吉田翔', type: 'デリバリー', status: '調理中', total: 2340, time: '14:28' },
        { id: 'ORD-012', user: '山本結衣', type: 'モバイルオーダー', status: '準備完了', total: 1120, time: '14:18' },
        { id: 'ORD-013', user: '佐々木大輔', type: 'お持ち帰り', status: '調理中', total: 890, time: '14:42' },
        { id: 'ORD-014', user: '松本花音', type: 'デリバリー', status: '確認済み', total: 1580, time: '14:45' },
        { id: 'ORD-015', user: '井上陽介', type: 'モバイルオーダー', status: '配達中', total: 760, time: '14:12' }
    ],
    restaurants: [
        { id: 1, name: 'マクドナルド渋谷店', address: '東京都渋谷区道玄坂1-2-3', status: '営業中', orders: 145 },
        { id: 2, name: 'マクドナルド新宿店', address: '東京都新宿区新宿3-38-1', status: '営業中', orders: 182 },
        { id: 3, name: 'マクドナルド池袋店', address: '東京都豊島区西池袋1-1-25', status: '営業中', orders: 128 },
        { id: 4, name: 'マクドナルド銀座店', address: '東京都中央区銀座4-6-16', status: '営業中', orders: 156 },
        { id: 5, name: 'マクドナルド原宿店', address: '東京都渋谷区神宮前1-13-12', status: '営業中', orders: 134 },
        { id: 6, name: 'マクドナルド秋葉原店', address: '東京都千代田区外神田1-15-8', status: '営業中', orders: 98 },
        { id: 7, name: 'マクドナルド上野店', address: '東京都台東区上野6-15-1', status: '営業中', orders: 112 },
        { id: 8, name: 'マクドナルド品川店', address: '東京都港区高輪3-26-21', status: '営業中', orders: 167 },
        { id: 9, name: 'マクドナルド横浜店', address: '神奈川県横浜市西区南幸1-1-1', status: '営業中', orders: 203 },
        { id: 10, name: 'マクドナルド大阪梅田店', address: '大阪府大阪市北区角田町8-7', status: '営業中', orders: 189 },
        { id: 11, name: 'マクドナルド名古屋栄店', address: '愛知県名古屋市中区栄3-4-5', status: '営業中', orders: 154 },
        { id: 12, name: 'マクドナルド福岡天神店', address: '福岡県福岡市中央区天神2-3-10', status: '営業中', orders: 142 }
    ],
    users: [
        { id: 1, name: '山田太郎', level: 'ゴールド', points: 1250, orders: 28 },
        { id: 2, name: '佐藤花子', level: 'シルバー', points: 680, orders: 15 },
        { id: 3, name: '鈴木一郎', level: 'プラチナ', points: 2340, orders: 52 },
        { id: 4, name: '田中美咲', level: 'ブロンズ', points: 320, orders: 8 },
        { id: 5, name: '伊藤美香', level: 'ゴールド', points: 1580, orders: 34 },
        { id: 6, name: '渡辺健', level: 'プラチナ', points: 3120, orders: 67 },
        { id: 7, name: '中村さくら', level: 'シルバー', points: 890, orders: 19 },
        { id: 8, name: '小林優太', level: 'ゴールド', points: 1420, orders: 31 },
        { id: 9, name: '加藤愛', level: 'ブロンズ', points: 450, orders: 11 },
        { id: 10, name: '吉田翔', level: 'プラチナ', points: 2780, orders: 58 },
        { id: 11, name: '山本結衣', level: 'ゴールド', points: 1690, orders: 36 },
        { id: 12, name: '佐々木大輔', level: 'シルバー', points: 920, orders: 22 },
        { id: 13, name: '松本花音', level: 'ブロンズ', points: 280, orders: 6 },
        { id: 14, name: '井上陽介', level: 'ゴールド', points: 1340, orders: 29 },
        { id: 15, name: '木村拓也', level: 'プラチナ', points: 4250, orders: 89 }
    ],
    dashboard: {
        todaySales: 2847600,
        todayOrders: 1247,
        averageOrderValue: 2283,
        topProducts: [
            { name: 'ビッグマック', sales: 342, revenue: 153900 },
            { name: 'マックフライポテト(M)', sales: 528, revenue: 153120 },
            { name: 'チーズバーガー', sales: 289, revenue: 43350 },
            { name: 'コカ・コーラ(M)', sales: 456, revenue: 86640 },
            { name: 'チキンマックナゲット', sales: 234, revenue: 58500 }
        ]
    },
    inventory: [
        { id: 1, name: 'ビーフパティ', stock: 450, unit: 'kg', minStock: 200, status: '正常', consumption: 85 },
        { id: 2, name: 'バンズ', stock: 1200, unit: '個', minStock: 500, status: '正常', consumption: 320 },
        { id: 3, name: 'レタス', stock: 85, unit: 'kg', minStock: 100, status: '要補充', consumption: 42 },
        { id: 4, name: 'チーズ', stock: 280, unit: 'kg', minStock: 150, status: '正常', consumption: 68 },
        { id: 5, name: 'ポテト', stock: 340, unit: 'kg', minStock: 200, status: '正常', consumption: 156 },
        { id: 6, name: 'チキンナゲット', stock: 156, unit: 'kg', minStock: 100, status: '正常', consumption: 48 },
        { id: 7, name: 'コーラシロップ', stock: 45, unit: 'L', minStock: 50, status: '要補充', consumption: 28 },
        { id: 8, name: '照り焼きソース', stock: 78, unit: 'L', minStock: 40, status: '正常', consumption: 22 },
        { id: 9, name: 'ピクルス', stock: 32, unit: 'kg', minStock: 30, status: '正常', consumption: 15 },
        { id: 10, name: '揚げ油', stock: 180, unit: 'L', minStock: 100, status: '正常', consumption: 35 }
    ],
    staff: [
        { id: 1, name: '田中一郎', position: '店長', hours: 168, performance: 95, shift: '08:00-17:00' },
        { id: 2, name: '鈴木美咲', position: 'マネージャー', hours: 152, performance: 92, shift: '09:00-18:00' },
        { id: 3, name: '佐藤健太', position: 'キッチン', hours: 144, performance: 88, shift: '06:00-15:00' },
        { id: 4, name: '高橋花子', position: 'カウンター', hours: 136, performance: 90, shift: '10:00-19:00' },
        { id: 5, name: '伊藤翔', position: 'キッチン', hours: 128, performance: 85, shift: '14:00-23:00' },
        { id: 6, name: '渡辺愛', position: 'カウンター', hours: 120, performance: 87, shift: '08:00-17:00' },
        { id: 7, name: '山本大輔', position: 'キッチン', hours: 132, performance: 89, shift: '06:00-15:00' },
        { id: 8, name: '中村さくら', position: 'カウンター', hours: 124, performance: 91, shift: '12:00-21:00' },
        { id: 9, name: '小林優太', position: 'デリバリー', hours: 140, performance: 86, shift: '10:00-19:00' },
        { id: 10, name: '加藤結衣', position: 'カウンター', hours: 116, performance: 88, shift: '09:00-18:00' }
    ],
    reviews: [
        { id: 1, user: '山田太郎', rating: 5, comment: 'いつも美味しい！サービスも最高です', date: '2026-01-19', type: '評価', status: '対応済み' },
        { id: 2, user: '佐藤花子', rating: 4, comment: 'ポテトが熱々で美味しかった', date: '2026-01-19', type: '評価', status: '対応済み' },
        { id: 3, user: '鈴木一郎', rating: 2, comment: '待ち時間が長すぎる', date: '2026-01-18', type: '苦情', status: '対応中' },
        { id: 4, user: '田中美咲', rating: 5, comment: 'モバイルオーダーが便利', date: '2026-01-18', type: '評価', status: '対応済み' },
        { id: 5, user: '高橋健太', rating: 3, comment: 'バーガーが冷めていた', date: '2026-01-18', type: '苦情', status: '対応中' },
        { id: 6, user: '伊藤美香', rating: 5, comment: 'スタッフの対応が素晴らしい', date: '2026-01-17', type: '評価', status: '対応済み' },
        { id: 7, user: '渡辺健', rating: 4, comment: '新商品が美味しかった', date: '2026-01-17', type: '評価', status: '対応済み' },
        { id: 8, user: '中村さくら', rating: 1, comment: '注文が間違っていた', date: '2026-01-17', type: '苦情', status: '対応済み' }
    ],
    delivery: [
        { id: 1, driver: '山田次郎', status: '配達中', orders: 3, location: '渋谷区', efficiency: 92, time: '12分', route: '渋谷→恵比寿→代官山' },
        { id: 2, driver: '鈴木三郎', status: '待機中', orders: 0, location: '新宿区', efficiency: 88, time: '-', route: '-' },
        { id: 3, driver: '佐藤五郎', status: '配達中', orders: 2, location: '池袋区', efficiency: 95, time: '8分', route: '池袋→大塚' },
        { id: 4, driver: '田中六郎', status: '配達中', orders: 4, location: '渋谷区', efficiency: 90, time: '15分', route: '渋谷→原宿→表参道→青山' },
        { id: 5, driver: '高橋七郎', status: '休憩中', orders: 0, location: '新宿区', efficiency: 87, time: '-', route: '-' },
        { id: 6, driver: '伊藤八郎', status: '配達中', orders: 3, location: '品川区', efficiency: 93, time: '10分', route: '品川→五反田→目黒' }
    ]
};

function createStatusBadge(status) {
    const badgeClasses = {
        '調理中': 'badge badge-cooking',
        '配達中': 'badge badge-delivering',
        '準備完了': 'badge badge-ready',
        '確認済み': 'badge badge-confirmed',
        '完了': 'badge badge-completed',
        '営業中': 'badge badge-open'
    };
    
    const className = badgeClasses[status] || 'badge badge-confirmed';
    return `<span class="${className}">${status}</span>`;
}

function createLevelBadge(level) {
    const badgeClasses = {
        'プラチナ': 'level-badge badge-platinum',
        'ゴールド': 'level-badge badge-gold',
        'シルバー': 'level-badge badge-silver',
        'ブロンズ': 'level-badge badge-bronze',
        '一般': 'level-badge badge-normal'
    };
    
    const className = badgeClasses[level] || 'level-badge badge-normal';
    return `<span class="${className}">${level}</span>`;
}

function renderMenu() {
    let html = `
        <div class="toolbar">
            <div class="search-box">
                <input type="text" class="search-input" placeholder="メニューを検索..." value="${currentSearchTerm}">
                <select class="filter-select" onchange="filterMenu(this.value)">
                    <option value="">全カテゴリー</option>
                    <option value="バーガー">バーガー</option>
                    <option value="朝マック">朝マック</option>
                    <option value="サイド">サイド</option>
                    <option value="ドリンク">ドリンク</option>
                    <option value="スイーツ">スイーツ</option>
                </select>
            </div>
            <div class="action-buttons">
                <button class="btn btn-success" onclick="addMenuItem()">
                    <span>+ 新規追加</span>
                </button>
                <button class="btn btn-primary" onclick="exportToCSV(mockData.menuItems, 'menu')">
                    <span>エクスポート</span>
                </button>
            </div>
        </div>
    `;
    
    let filtered = filterData(mockData.menuItems, 
        currentFilters.menu || {}, 
        currentSearchTerm);
    let sorted = sortData(filtered, currentSort.column, currentSort.direction);
    let paginated = paginateData(sorted, currentPage, itemsPerPage);
    
    if (paginated.length === 0) {
        html += '<div class="empty-state"><p>メニューが見つかりません</p></div>';
    } else {
        const menuHTML = paginated.map(item => `
            <div class="menu-card">
                <div class="menu-image">
                    ${item.image ? 
                        `<img src="${item.image}" alt="${item.name}" style="width: 100%; height: 100%; object-fit: cover; border-radius: 0.5rem;">` :
                        `<svg class="icon-medium" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="3" y1="12" x2="21" y2="12"></line>
                            <line x1="3" y1="6" x2="21" y2="6"></line>
                            <line x1="3" y1="18" x2="21" y2="18"></line>
                        </svg>`
                    }
                </div>
                <h3 class="menu-name">${item.name}</h3>
                <p class="menu-name-en">${item.nameEn}</p>
                <div class="menu-footer">
                    <span class="menu-price">¥${item.price}</span>
                    <span class="menu-calories">${item.calories}kcal</span>
                </div>
                <div class="action-buttons" style="margin-top: 0.75rem;">
                    <button class="btn btn-primary btn-small" onclick="editMenuItem(${item.id})" style="flex: 1;">編集</button>
                    <button class="btn btn-danger btn-small" onclick="deleteMenuItem(${item.id})" style="flex: 1;">削除</button>
                </div>
            </div>
        `).join('');
        
        html += `<div class="menu-grid">${menuHTML}</div>`;
    }
    
    html += createPagination(sorted.length, currentPage, itemsPerPage, 'changePage');
    
    return html;
}

let searchTimer = null;

function searchMenu(term) {
    currentSearchTerm = term;
    currentPage = 1;
    
    if (searchTimer) clearTimeout(searchTimer);
    
    searchTimer = setTimeout(() => {
        renderContent('menu');
    }, 300);
}

function filterMenu(category) {
    if (!currentFilters.menu) currentFilters.menu = {};
    currentFilters.menu.category = category || undefined;
    currentPage = 1;
    renderContent('menu');
}

function changePage(page) {
    currentPage = page;
    renderContent(currentSubTab || currentMainTab);
}

function addMenuItem() {
    openModal('新規メニュー追加', `
        <div class="form-group">
            <label class="form-label">商品名（日本語）</label>
            <input type="text" id="item-name" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">商品名（英語）</label>
            <input type="text" id="item-nameEn" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">価格（円）</label>
            <input type="number" id="item-price" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">カテゴリー</label>
            <select id="item-category" class="form-select" required>
                <option value="バーガー">バーガー</option>
                <option value="朝マック">朝マック</option>
                <option value="サイド">サイド</option>
                <option value="ドリンク">ドリンク</option>
                <option value="スイーツ">スイーツ</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">カロリー（kcal）</label>
            <input type="number" id="item-calories" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">画像URL</label>
            <input type="text" id="item-image" class="form-input">
        </div>
    `, () => {
        const newItem = {
            id: Math.max(...mockData.menuItems.map(i => i.id)) + 1,
            name: document.getElementById('item-name').value,
            nameEn: document.getElementById('item-nameEn').value,
            price: parseInt(document.getElementById('item-price').value),
            category: document.getElementById('item-category').value,
            calories: parseInt(document.getElementById('item-calories').value),
            image: document.getElementById('item-image').value
        };
        
        mockData.menuItems.push(newItem);
        closeModal();
        renderContent('menu');
        showNotification('メニューを追加しました', 'success');
    });
}

function editMenuItem(id) {
    const item = mockData.menuItems.find(i => i.id === id);
    if (!item) return;
    
    openModal('メニュー編集', `
        <div class="form-group">
            <label class="form-label">商品名（日本語）</label>
            <input type="text" id="item-name" class="form-input" value="${item.name}" required>
        </div>
        <div class="form-group">
            <label class="form-label">商品名（英語）</label>
            <input type="text" id="item-nameEn" class="form-input" value="${item.nameEn}" required>
        </div>
        <div class="form-group">
            <label class="form-label">価格（円）</label>
            <input type="number" id="item-price" class="form-input" value="${item.price}" required>
        </div>
        <div class="form-group">
            <label class="form-label">カテゴリー</label>
            <select id="item-category" class="form-select" required>
                <option value="バーガー" ${item.category === 'バーガー' ? 'selected' : ''}>バーガー</option>
                <option value="朝マック" ${item.category === '朝マック' ? 'selected' : ''}>朝マック</option>
                <option value="サイド" ${item.category === 'サイド' ? 'selected' : ''}>サイド</option>
                <option value="ドリンク" ${item.category === 'ドリンク' ? 'selected' : ''}>ドリンク</option>
                <option value="スイーツ" ${item.category === 'スイーツ' ? 'selected' : ''}>スイーツ</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">カロリー（kcal）</label>
            <input type="number" id="item-calories" class="form-input" value="${item.calories}" required>
        </div>
        <div class="form-group">
            <label class="form-label">画像URL</label>
            <input type="text" id="item-image" class="form-input" value="${item.image || ''}">
        </div>
    `, () => {
        item.name = document.getElementById('item-name').value;
        item.nameEn = document.getElementById('item-nameEn').value;
        item.price = parseInt(document.getElementById('item-price').value);
        item.category = document.getElementById('item-category').value;
        item.calories = parseInt(document.getElementById('item-calories').value);
        item.image = document.getElementById('item-image').value;
        
        closeModal();
        renderContent('menu');
        showNotification('メニューを更新しました', 'success');
    });
}

function deleteMenuItem(id) {
    confirm('このメニューを削除しますか？', () => {
        const index = mockData.menuItems.findIndex(i => i.id === id);
        if (index !== -1) {
            mockData.menuItems.splice(index, 1);
            renderContent('menu');
            showNotification('メニューを削除しました', 'success');
        }
    });
}

function renderOrders() {
    let html = `
        <div class="toolbar">
            <div class="search-box">
                <input type="text" class="search-input" placeholder="注文を検索..." value="${currentSearchTerm}">
                <select class="filter-select" onchange="filterOrders('status', this.value)">
                    <option value="">全ステータス</option>
                    <option value="調理中">調理中</option>
                    <option value="配達中">配達中</option>
                    <option value="準備完了">準備完了</option>
                    <option value="確認済み">確認済み</option>
                    <option value="完了">完了</option>
                </select>
                <select class="filter-select" onchange="filterOrders('type', this.value)">
                    <option value="">全タイプ</option>
                    <option value="モバイルオーダー">モバイルオーダー</option>
                    <option value="デリバリー">デリバリー</option>
                    <option value="お持ち帰り">お持ち帰り</option>
                </select>
            </div>
            <div class="action-buttons">
                <button class="btn btn-success" onclick="addOrder()">+ 新規注文</button>
                <button class="btn btn-primary" onclick="exportToCSV(mockData.orders, 'orders')">エクスポート</button>
            </div>
        </div>
    `;
    
    let filtered = filterData(mockData.orders, currentFilters.orders || {}, currentSearchTerm);
    let sorted = sortData(filtered, currentSort.column, currentSort.direction);
    let paginated = paginateData(sorted, currentPage, itemsPerPage);
    
    if (paginated.length === 0) {
        html += '<div class="empty-state"><p>注文が見つかりません</p></div>';
    } else {
        const ordersHTML = paginated.map(order => `
            <tr>
                <td class="font-medium">${order.id}</td>
                <td>${order.user}</td>
                <td>${order.type}</td>
                <td>${createStatusBadge(order.status)}</td>
                <td class="font-bold">¥${order.total.toLocaleString()}</td>
                <td>${order.time}</td>
                <td>
                    <div class="action-buttons">
                        <button class="btn btn-primary btn-small btn-icon" onclick="editOrder('${order.id}')" title="編集">編集</button>
                        <button class="btn btn-danger btn-small btn-icon" onclick="deleteOrder('${order.id}')" title="削除">削除</button>
                    </div>
                </td>
            </tr>
        `).join('');
        
        html += `
            <div class="data-table">
                <table>
                    <thead>
                        <tr>
                            <th class="sortable-header" onclick="sortOrders('id')">注文番号<span class="sort-icon"></span></th>
                            <th class="sortable-header" onclick="sortOrders('user')">顧客名<span class="sort-icon"></span></th>
                            <th>注文タイプ</th>
                            <th>ステータス</th>
                            <th class="sortable-header" onclick="sortOrders('total')">金額<span class="sort-icon"></span></th>
                            <th class="sortable-header" onclick="sortOrders('time')">時刻<span class="sort-icon"></span></th>
                            <th>操作</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${ordersHTML}
                    </tbody>
                </table>
            </div>
        `;
    }
    
    html += createPagination(sorted.length, currentPage, itemsPerPage, 'changePage');
    return html;
}

function searchOrders(term) {
    currentSearchTerm = term;
    currentPage = 1;
    renderContent('orders');
}

function filterOrders(key, value) {
    if (!currentFilters.orders) currentFilters.orders = {};
    currentFilters.orders[key] = value || undefined;
    currentPage = 1;
    renderContent('orders');
}

function sortOrders(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    renderContent('orders');
}

function addOrder() {
    openModal('新規注文追加', `
        <div class="form-group">
            <label class="form-label">注文番号</label>
            <input type="text" id="order-id" class="form-input" value="ORD-${String(mockData.orders.length + 1).padStart(3, '0')}" required>
        </div>
        <div class="form-group">
            <label class="form-label">顧客名</label>
            <input type="text" id="order-user" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">注文タイプ</label>
            <select id="order-type" class="form-select" required>
                <option value="モバイルオーダー">モバイルオーダー</option>
                <option value="デリバリー">デリバリー</option>
                <option value="お持ち帰り">お持ち帰り</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">ステータス</label>
            <select id="order-status" class="form-select" required>
                <option value="確認済み">確認済み</option>
                <option value="調理中">調理中</option>
                <option value="準備完了">準備完了</option>
                <option value="配達中">配達中</option>
                <option value="完了">完了</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">金額（円）</label>
            <input type="number" id="order-total" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">時刻</label>
            <input type="time" id="order-time" class="form-input" required>
        </div>
    `, () => {
        const newOrder = {
            id: document.getElementById('order-id').value,
            user: document.getElementById('order-user').value,
            type: document.getElementById('order-type').value,
            status: document.getElementById('order-status').value,
            total: parseInt(document.getElementById('order-total').value),
            time: document.getElementById('order-time').value
        };
        
        mockData.orders.push(newOrder);
        closeModal();
        renderContent('orders');
        showNotification('注文を追加しました', 'success');
    });
}

function editOrder(id) {
    const order = mockData.orders.find(o => o.id === id);
    if (!order) return;
    
    openModal('注文編集', `
        <div class="form-group">
            <label class="form-label">顧客名</label>
            <input type="text" id="order-user" class="form-input" value="${order.user}" required>
        </div>
        <div class="form-group">
            <label class="form-label">注文タイプ</label>
            <select id="order-type" class="form-select" required>
                <option value="モバイルオーダー" ${order.type === 'モバイルオーダー' ? 'selected' : ''}>モバイルオーダー</option>
                <option value="デリバリー" ${order.type === 'デリバリー' ? 'selected' : ''}>デリバリー</option>
                <option value="お持ち帰り" ${order.type === 'お持ち帰り' ? 'selected' : ''}>お持ち帰り</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">ステータス</label>
            <select id="order-status" class="form-select" required>
                <option value="確認済み" ${order.status === '確認済み' ? 'selected' : ''}>確認済み</option>
                <option value="調理中" ${order.status === '調理中' ? 'selected' : ''}>調理中</option>
                <option value="準備完了" ${order.status === '準備完了' ? 'selected' : ''}>準備完了</option>
                <option value="配達中" ${order.status === '配達中' ? 'selected' : ''}>配達中</option>
                <option value="完了" ${order.status === '完了' ? 'selected' : ''}>完了</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">金額（円）</label>
            <input type="number" id="order-total" class="form-input" value="${order.total}" required>
        </div>
        <div class="form-group">
            <label class="form-label">時刻</label>
            <input type="time" id="order-time" class="form-input" value="${order.time}" required>
        </div>
    `, () => {
        order.user = document.getElementById('order-user').value;
        order.type = document.getElementById('order-type').value;
        order.status = document.getElementById('order-status').value;
        order.total = parseInt(document.getElementById('order-total').value);
        order.time = document.getElementById('order-time').value;
        
        closeModal();
        renderContent('orders');
        showNotification('注文を更新しました', 'success');
    });
}

function deleteOrder(id) {
    confirm('この注文を削除しますか？', () => {
        const index = mockData.orders.findIndex(o => o.id === id);
        if (index !== -1) {
            mockData.orders.splice(index, 1);
            renderContent('orders');
            showNotification('注文を削除しました', 'success');
        }
    });
}

function renderRestaurants() {
    let html = `
        <div class="toolbar">
            <div class="search-box">
                <input type="text" class="search-input" placeholder="店舗を検索..." value="${currentSearchTerm}">
            </div>
            <div class="action-buttons">
                <button class="btn btn-success" onclick="addRestaurant()">+ 新規追加</button>
                <button class="btn btn-primary" onclick="exportToCSV(mockData.restaurants, 'restaurants')">エクスポート</button>
            </div>
        </div>
    `;
    
    let filtered = filterData(mockData.restaurants, {}, currentSearchTerm);
    let paginated = paginateData(filtered, currentPage, 6);
    
    const restaurantsHTML = paginated.map(restaurant => {
        const ordersColor = restaurant.orders >= 150 ? '#10B981' : restaurant.orders >= 100 ? '#FBBF24' : '#ffffff';
        return `
        <div class="restaurant-card">
            <div class="restaurant-header">
                <div>
                    <h3 class="restaurant-name">${restaurant.name}</h3>
                    <p class="restaurant-address">
                        <svg class="icon-tiny" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path>
                            <circle cx="12" cy="10" r="3"></circle>
                        </svg>
                        ${restaurant.address}
                    </p>
                </div>
                ${createStatusBadge(restaurant.status)}
            </div>
            <div class="restaurant-footer">
                <span>本日の注文数</span>
                <span class="restaurant-orders" style="color: ${ordersColor};">${restaurant.orders}</span>
            </div>
            <div style="margin-top: 1rem;">
                <div style="background: #3f3f3f; border-radius: 0.25rem; height: 0.5rem; overflow: hidden;">
                    <div style="background: ${ordersColor}; height: 100%; width: ${Math.min(restaurant.orders / 200 * 100, 100)}%; transition: width 0.3s;"></div>
                </div>
            </div>
            <div class="action-buttons" style="margin-top: 1rem;">
                <button class="btn btn-primary btn-small" onclick="editRestaurant(${restaurant.id})" style="flex: 1;">編集</button>
                <button class="btn btn-danger btn-small" onclick="deleteRestaurant(${restaurant.id})" style="flex: 1;">削除</button>
            </div>
        </div>
    `}).join('');
    
    html += `<div class="restaurant-grid">${restaurantsHTML}</div>`;
    html += createPagination(filtered.length, currentPage, 6, 'changePage');
    
    return html;
}

function renderUsers() {
    let html = `
        <div class="toolbar">
            <div class="search-box">
                <input type="text" class="search-input" placeholder="顧客を検索..." value="${currentSearchTerm}">
                <select class="filter-select" onchange="filterUsers(this.value)">
                    <option value="">全レベル</option>
                    <option value="プラチナ">プラチナ</option>
                    <option value="ゴールド">ゴールド</option>
                    <option value="シルバー">シルバー</option>
                    <option value="ブロンズ">ブロンズ</option>
                </select>
            </div>
            <div class="action-buttons">
                <button class="btn btn-success" onclick="addUser()">+ 新規追加</button>
                <button class="btn btn-primary" onclick="exportToCSV(mockData.users, 'users')">エクスポート</button>
            </div>
        </div>
    `;
    
    let filtered = filterData(mockData.users, currentFilters.users || {}, currentSearchTerm);
    let sorted = sortData(filtered, currentSort.column, currentSort.direction);
    let paginated = paginateData(sorted, currentPage, itemsPerPage);
    
    const usersHTML = paginated.map(user => `
        <tr>
            <td class="font-medium">${user.name}</td>
            <td>${createLevelBadge(user.level)}</td>
            <td class="points-text">${user.points.toLocaleString()}pt</td>
            <td>${user.orders}回</td>
            <td>
                <div style="background: #3f3f3f; border-radius: 0.25rem; height: 1.5rem; position: relative; overflow: hidden;">
                    <div style="background: #F59E0B; height: 100%; width: ${Math.min(user.orders / 100 * 100, 100)}%; transition: width 0.3s;"></div>
                    <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.75rem; color: white;">
                        ${Math.min(user.orders, 100)}%
                    </span>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-small btn-icon" onclick="editUser(${user.id})">編集</button>
                    <button class="btn btn-danger btn-small btn-icon" onclick="deleteUser(${user.id})">削除</button>
                </div>
            </td>
        </tr>
    `).join('');
    
    html += `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th class="sortable-header" onclick="sortUsers('name')">顧客名<span class="sort-icon"></span></th>
                        <th>会員レベル</th>
                        <th class="sortable-header" onclick="sortUsers('points')">ポイント<span class="sort-icon"></span></th>
                        <th class="sortable-header" onclick="sortUsers('orders')">注文回数<span class="sort-icon"></span></th>
                        <th>アクティビティ</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${usersHTML}
                </tbody>
            </table>
        </div>
    `;
    
    html += createPagination(sorted.length, currentPage, itemsPerPage, 'changePage');
    return html;
}

function filterUsers(level) {
    if (!currentFilters.users) currentFilters.users = {};
    currentFilters.users.level = level || undefined;
    currentPage = 1;
    renderContent('users');
}

function sortUsers(column) {
    if (currentSort.column === column) {
        currentSort.direction = currentSort.direction === 'asc' ? 'desc' : 'asc';
    } else {
        currentSort.column = column;
        currentSort.direction = 'asc';
    }
    renderContent('users');
}

function addRestaurant() {
    openModal('新規店舗追加', `
        <div class="form-group">
            <label class="form-label">店舗名</label>
            <input type="text" id="rest-name" class="form-input" placeholder="マクドナルド○○店" required>
        </div>
        <div class="form-group">
            <label class="form-label">住所</label>
            <input type="text" id="rest-address" class="form-input" placeholder="東京都..." required>
        </div>
        <div class="form-group">
            <label class="form-label">ステータス</label>
            <select id="rest-status" class="form-select" required>
                <option value="営業中">営業中</option>
                <option value="準備中">準備中</option>
                <option value="休業中">休業中</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">本日の注文数</label>
            <input type="number" id="rest-orders" class="form-input" value="0" required>
        </div>
    `, () => {
        const newRestaurant = {
            id: Math.max(...mockData.restaurants.map(r => r.id)) + 1,
            name: document.getElementById('rest-name').value,
            address: document.getElementById('rest-address').value,
            status: document.getElementById('rest-status').value,
            orders: parseInt(document.getElementById('rest-orders').value)
        };
        
        if (!newRestaurant.name || !newRestaurant.address) {
            showNotification('必須項目を入力してください', 'error');
            return;
        }
        
        mockData.restaurants.push(newRestaurant);
        closeModal();
        renderContent('restaurants');
        showNotification('店舗を追加しました', 'success');
    });
}

function editRestaurant(id) {
    const restaurant = mockData.restaurants.find(r => r.id === id);
    if (!restaurant) return;
    
    openModal('店舗編集', `
        <div class="form-group">
            <label class="form-label">店舗名</label>
            <input type="text" id="rest-name" class="form-input" value="${restaurant.name}" required>
        </div>
        <div class="form-group">
            <label class="form-label">住所</label>
            <input type="text" id="rest-address" class="form-input" value="${restaurant.address}" required>
        </div>
        <div class="form-group">
            <label class="form-label">ステータス</label>
            <select id="rest-status" class="form-select" required>
                <option value="営業中" ${restaurant.status === '営業中' ? 'selected' : ''}>営業中</option>
                <option value="準備中" ${restaurant.status === '準備中' ? 'selected' : ''}>準備中</option>
                <option value="休業中" ${restaurant.status === '休業中' ? 'selected' : ''}>休業中</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">本日の注文数</label>
            <input type="number" id="rest-orders" class="form-input" value="${restaurant.orders}" required>
        </div>
    `, () => {
        restaurant.name = document.getElementById('rest-name').value;
        restaurant.address = document.getElementById('rest-address').value;
        restaurant.status = document.getElementById('rest-status').value;
        restaurant.orders = parseInt(document.getElementById('rest-orders').value);
        
        closeModal();
        renderContent('restaurants');
        showNotification('店舗を更新しました', 'success');
    });
}

function deleteRestaurant(id) {
    confirm('この店舗を削除しますか？', () => {
        const index = mockData.restaurants.findIndex(r => r.id === id);
        if (index !== -1) {
            mockData.restaurants.splice(index, 1);
            renderContent('restaurants');
            showNotification('店舗を削除しました', 'success');
        }
    });
}

function addUser() {
    openModal('新規顧客追加', `
        <div class="form-group">
            <label class="form-label">顧客名</label>
            <input type="text" id="user-name" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">会員レベル</label>
            <select id="user-level" class="form-select" required>
                <option value="ブロンズ">ブロンズ</option>
                <option value="シルバー">シルバー</option>
                <option value="ゴールド">ゴールド</option>
                <option value="プラチナ">プラチナ</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">ポイント</label>
            <input type="number" id="user-points" class="form-input" value="0" required>
        </div>
        <div class="form-group">
            <label class="form-label">注文回数</label>
            <input type="number" id="user-orders" class="form-input" value="0" required>
        </div>
    `, () => {
        const newUser = {
            id: Math.max(...mockData.users.map(u => u.id)) + 1,
            name: document.getElementById('user-name').value,
            level: document.getElementById('user-level').value,
            points: parseInt(document.getElementById('user-points').value),
            orders: parseInt(document.getElementById('user-orders').value)
        };
        
        if (!newUser.name) {
            showNotification('顧客名を入力してください', 'error');
            return;
        }
        
        mockData.users.push(newUser);
        closeModal();
        renderContent('users');
        showNotification('顧客を追加しました', 'success');
    });
}

function editUser(id) {
    const user = mockData.users.find(u => u.id === id);
    if (!user) return;
    
    openModal('顧客編集', `
        <div class="form-group">
            <label class="form-label">顧客名</label>
            <input type="text" id="user-name" class="form-input" value="${user.name}" required>
        </div>
        <div class="form-group">
            <label class="form-label">会員レベル</label>
            <select id="user-level" class="form-select" required>
                <option value="ブロンズ" ${user.level === 'ブロンズ' ? 'selected' : ''}>ブロンズ</option>
                <option value="シルバー" ${user.level === 'シルバー' ? 'selected' : ''}>シルバー</option>
                <option value="ゴールド" ${user.level === 'ゴールド' ? 'selected' : ''}>ゴールド</option>
                <option value="プラチナ" ${user.level === 'プラチナ' ? 'selected' : ''}>プラチナ</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">ポイント</label>
            <input type="number" id="user-points" class="form-input" value="${user.points}" required>
        </div>
        <div class="form-group">
            <label class="form-label">注文回数</label>
            <input type="number" id="user-orders" class="form-input" value="${user.orders}" required>
        </div>
    `, () => {
        user.name = document.getElementById('user-name').value;
        user.level = document.getElementById('user-level').value;
        user.points = parseInt(document.getElementById('user-points').value);
        user.orders = parseInt(document.getElementById('user-orders').value);
        
        closeModal();
        renderContent('users');
        showNotification('顧客を更新しました', 'success');
    });
}

function deleteUser(id) {
    confirm('この顧客を削除しますか？', () => {
        const index = mockData.users.findIndex(u => u.id === id);
        if (index !== -1) {
            mockData.users.splice(index, 1);
            renderContent('users');
            showNotification('顧客を削除しました', 'success');
        }
    });
}

function addStaff() {
    openModal('新規スタッフ追加', `
        <div class="form-group">
            <label class="form-label">スタッフ名</label>
            <input type="text" id="staff-name" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">役職</label>
            <select id="staff-position" class="form-select" required>
                <option value="店長">店長</option>
                <option value="マネージャー">マネージャー</option>
                <option value="キッチン">キッチン</option>
                <option value="カウンター">カウンター</option>
                <option value="デリバリー">デリバリー</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">今月の勤務時間</label>
            <input type="number" id="staff-hours" class="form-input" value="0" required>
        </div>
        <div class="form-group">
            <label class="form-label">パフォーマンス（%）</label>
            <input type="number" id="staff-performance" class="form-input" value="80" min="0" max="100" required>
        </div>
        <div class="form-group">
            <label class="form-label">シフト時間</label>
            <input type="text" id="staff-shift" class="form-input" placeholder="08:00-17:00" required>
        </div>
    `, () => {
        const newStaff = {
            id: Math.max(...mockData.staff.map(s => s.id)) + 1,
            name: document.getElementById('staff-name').value,
            position: document.getElementById('staff-position').value,
            hours: parseInt(document.getElementById('staff-hours').value),
            performance: parseInt(document.getElementById('staff-performance').value),
            shift: document.getElementById('staff-shift').value
        };
        
        if (!newStaff.name || !newStaff.shift) {
            showNotification('必須項目を入力してください', 'error');
            return;
        }
        
        mockData.staff.push(newStaff);
        closeModal();
        renderContent('staff');
        showNotification('スタッフを追加しました', 'success');
    });
}

function editStaff(id) {
    const staff = mockData.staff.find(s => s.id === id);
    if (!staff) return;
    
    openModal('スタッフ編集', `
        <div class="form-group">
            <label class="form-label">スタッフ名</label>
            <input type="text" id="staff-name" class="form-input" value="${staff.name}" required>
        </div>
        <div class="form-group">
            <label class="form-label">役職</label>
            <select id="staff-position" class="form-select" required>
                <option value="店長" ${staff.position === '店長' ? 'selected' : ''}>店長</option>
                <option value="マネージャー" ${staff.position === 'マネージャー' ? 'selected' : ''}>マネージャー</option>
                <option value="キッチン" ${staff.position === 'キッチン' ? 'selected' : ''}>キッチン</option>
                <option value="カウンター" ${staff.position === 'カウンター' ? 'selected' : ''}>カウンター</option>
                <option value="デリバリー" ${staff.position === 'デリバリー' ? 'selected' : ''}>デリバリー</option>
            </select>
        </div>
        <div class="form-group">
            <label class="form-label">今月の勤務時間</label>
            <input type="number" id="staff-hours" class="form-input" value="${staff.hours}" required>
        </div>
        <div class="form-group">
            <label class="form-label">パフォーマンス（%）</label>
            <input type="number" id="staff-performance" class="form-input" value="${staff.performance}" min="0" max="100" required>
        </div>
        <div class="form-group">
            <label class="form-label">シフト時間</label>
            <input type="text" id="staff-shift" class="form-input" value="${staff.shift}" required>
        </div>
    `, () => {
        staff.name = document.getElementById('staff-name').value;
        staff.position = document.getElementById('staff-position').value;
        staff.hours = parseInt(document.getElementById('staff-hours').value);
        staff.performance = parseInt(document.getElementById('staff-performance').value);
        staff.shift = document.getElementById('staff-shift').value;
        
        closeModal();
        renderContent('staff');
        showNotification('スタッフを更新しました', 'success');
    });
}

function deleteStaff(id) {
    confirm('このスタッフを削除しますか？', () => {
        const index = mockData.staff.findIndex(s => s.id === id);
        if (index !== -1) {
            mockData.staff.splice(index, 1);
            renderContent('staff');
            showNotification('スタッフを削除しました', 'success');
        }
    });
}

function renderDashboard() {
    const topProductsHTML = mockData.dashboard.topProducts.map((product, index) => `
        <tr>
            <td class="font-medium">${index + 1}. ${product.name}</td>
            <td>${product.sales}個</td>
            <td class="font-bold">¥${product.revenue.toLocaleString()}</td>
            <td>
                <div style="background: #3f3f3f; border-radius: 0.25rem; height: 1.5rem; position: relative; overflow: hidden;">
                    <div style="background: #F59E0B; height: 100%; width: ${(product.sales / 528 * 100)}%; transition: width 0.3s;"></div>
                </div>
            </td>
        </tr>
        `).join('');
    
    const lowStockCount = mockData.inventory.filter(i => i.status === '要補充').length;
    const activeOrders = mockData.orders.filter(o => o.status !== '完了').length;
    const complaints = mockData.reviews.filter(r => r.type === '苦情' && r.status === '対応中').length;
    
    return `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div class="restaurant-card" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);">
                <h3 style="color: #000; font-size: 0.875rem; margin-bottom: 0.5rem;">本日の売上高</h3>
                <p style="color: #000; font-size: 2rem; font-weight: bold;">¥${mockData.dashboard.todaySales.toLocaleString()}</p>
                <p style="color: #000; font-size: 0.75rem; margin-top: 0.5rem;">前日比 +12%</p>
            </div>
            <div class="restaurant-card" style="background: linear-gradient(135deg, #FBBF24 0%, #F59E0B 100%);">
                <h3 style="color: #000; font-size: 0.875rem; margin-bottom: 0.5rem;">本日の注文数</h3>
                <p style="color: #000; font-size: 2rem; font-weight: bold;">${mockData.dashboard.todayOrders}件</p>
                <p style="color: #000; font-size: 0.75rem; margin-top: 0.5rem;">処理中: ${activeOrders}件</p>
            </div>
            <div class="restaurant-card" style="background: linear-gradient(135deg, #FCD34D 0%, #FBBF24 100%);">
                <h3 style="color: #000; font-size: 0.875rem; margin-bottom: 0.5rem;">平均注文額</h3>
                <p style="color: #000; font-size: 2rem; font-weight: bold;">¥${mockData.dashboard.averageOrderValue.toLocaleString()}</p>
                <p style="color: #000; font-size: 0.75rem; margin-top: 0.5rem;">目標達成率: 95%</p>
            </div>
            <div class="restaurant-card" style="background: linear-gradient(135deg, #FB923C 0%, #F59E0B 100%);">
                <h3 style="color: #000; font-size: 0.875rem; margin-bottom: 0.5rem;">システムアラート</h3>
                <p style="color: #000; font-size: 1.25rem; font-weight: bold; margin: 0.5rem 0;">
                    ${lowStockCount > 0 ? `在庫不足: ${lowStockCount}件` : '全て正常'}
                </p>
                <p style="color: #000; font-size: 0.75rem;">
                    ${complaints > 0 ? `未処理の苦情: ${complaints}件` : ''}
                </p>
            </div>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr)); gap: 1rem;">
            <div class="data-table">
                <h3 style="padding: 1rem 1.5rem; color: #ffffff; font-size: 1.125rem; border-bottom: 1px solid #3f3f3f;">
                    人気商品トップ5
                </h3>
                <table>
                    <thead>
                        <tr>
                            <th>商品名</th>
                            <th>販売数</th>
                            <th>売上</th>
                            <th>グラフ</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${topProductsHTML}
                    </tbody>
                </table>
            </div>
            
            <div class="data-table">
                <h3 style="padding: 1rem 1.5rem; color: #ffffff; font-size: 1.125rem; border-bottom: 1px solid #3f3f3f;">
                    クイックステータス
                </h3>
                <div style="padding: 1.5rem;">
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: #ffffff; font-size: 0.875rem;">営業店舗</span>
                            <span style="color: #F59E0B; font-weight: bold;">${mockData.restaurants.length}/12</span>
                        </div>
                        <div style="background: #3f3f3f; height: 0.5rem; border-radius: 0.25rem; overflow: hidden;">
                            <div style="background: #10B981; height: 100%; width: 100%;"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: #ffffff; font-size: 0.875rem;">稼働スタッフ</span>
                            <span style="color: #F59E0B; font-weight: bold;">${mockData.staff.length}/10</span>
                        </div>
                        <div style="background: #3f3f3f; height: 0.5rem; border-radius: 0.25rem; overflow: hidden;">
                            <div style="background: #10B981; height: 100%; width: 100%;"></div>
                        </div>
                    </div>
                    <div style="margin-bottom: 1.5rem;">
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: #ffffff; font-size: 0.875rem;">配達ドライバー</span>
                            <span style="color: #F59E0B; font-weight: bold;">${mockData.delivery.filter(d => d.status === '配達中').length}/${mockData.delivery.length}</span>
                        </div>
                        <div style="background: #3f3f3f; height: 0.5rem; border-radius: 0.25rem; overflow: hidden;">
                            <div style="background: #FBBF24; height: 100%; width: ${(mockData.delivery.filter(d => d.status === '配達中').length / mockData.delivery.length * 100)}%;"></div>
                        </div>
                    </div>
                    <div>
                        <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                            <span style="color: #ffffff; font-size: 0.875rem;">顧客満足度</span>
                            <span style="color: #F59E0B; font-weight: bold;">${(mockData.reviews.reduce((s, r) => s + r.rating, 0) / mockData.reviews.length).toFixed(1)} ★</span>
                        </div>
                        <div style="background: #3f3f3f; height: 0.5rem; border-radius: 0.25rem; overflow: hidden;">
                            <div style="background: #10B981; height: 100%; width: ${(mockData.reviews.reduce((s, r) => s + r.rating, 0) / mockData.reviews.length / 5 * 100)}%;"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function renderInventory() {
    const lowStock = mockData.inventory.filter(i => i.status === '要補充');
    let html = '';
    
    if (lowStock.length > 0) {
        html += `<div class="notification notification-warning" style="margin-bottom: 1rem; position: relative;">
            警告: ${lowStock.length}件の食材が補充を必要としています
        </div>`;
    }
    
    html += `
        <div class="toolbar">
            <div class="search-box">
                <input type="text" class="search-input" placeholder="食材を検索..." value="${currentSearchTerm}">
                <select class="filter-select" onchange="filterInventory(this.value)">
                    <option value="">全ステータス</option>
                    <option value="正常">正常</option>
                    <option value="要補充">要補充</option>
                </select>
            </div>
            <div class="action-buttons">
                <button class="btn btn-success" onclick="addInventoryItem()">+ 新規追加</button>
                <button class="btn btn-primary" onclick="exportToCSV(mockData.inventory, 'inventory')">エクスポート</button>
            </div>
        </div>
    `;
    
    let filtered = filterData(mockData.inventory, currentFilters.inventory || {}, currentSearchTerm);
    let paginated = paginateData(filtered, currentPage, itemsPerPage);
    
    const inventoryHTML = paginated.map(item => {
        const statusClass = item.status === '要補充' ? 'badge-confirmed' : 'badge-open';
        const percentage = ((item.stock / item.minStock) * 100).toFixed(0);
        return `
        <tr>
            <td class="font-medium">${item.name}</td>
            <td>${item.stock} ${item.unit}</td>
            <td>${item.minStock} ${item.unit}</td>
            <td>${item.consumption} ${item.unit}/日</td>
            <td><span class="badge ${statusClass}">${item.status}</span></td>
            <td>
                <div style="background: #3f3f3f; border-radius: 0.25rem; height: 1.5rem; position: relative; overflow: hidden;">
                    <div style="background: ${percentage < 100 ? '#EF4444' : '#10B981'}; height: 100%; width: ${Math.min(percentage, 100)}%; transition: width 0.3s;"></div>
                    <span style="position: absolute; top: 50%; left: 50%; transform: translate(-50%, -50%); font-size: 0.75rem; color: white;">${percentage}%</span>
                </div>
            </td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-small btn-icon" onclick="editInventoryItem(${item.id})">編集</button>
                    <button class="btn btn-danger btn-small btn-icon" onclick="deleteInventoryItem(${item.id})">削除</button>
                </div>
            </td>
        </tr>
    `}).join('');
    
    html += `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>食材名</th>
                        <th>現在庫</th>
                        <th>最小在庫</th>
                        <th>1日消費量</th>
                        <th>ステータス</th>
                        <th>在庫率</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${inventoryHTML}
                </tbody>
            </table>
        </div>
    `;
    
    html += createPagination(filtered.length, currentPage, itemsPerPage, 'changePage');
    return html;
}

function filterInventory(status) {
    if (!currentFilters.inventory) currentFilters.inventory = {};
    currentFilters.inventory.status = status || undefined;
    currentPage = 1;
    renderContent('inventory');
}

function addInventoryItem() {
    openModal('新規食材追加', `
        <div class="form-group">
            <label class="form-label">食材名</label>
            <input type="text" id="inv-name" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">現在庫</label>
            <input type="number" id="inv-stock" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">単位</label>
            <input type="text" id="inv-unit" class="form-input" placeholder="kg, L, 個など" required>
        </div>
        <div class="form-group">
            <label class="form-label">最小在庫</label>
            <input type="number" id="inv-minStock" class="form-input" required>
        </div>
        <div class="form-group">
            <label class="form-label">1日消費量</label>
            <input type="number" id="inv-consumption" class="form-input" required>
        </div>
    `, () => {
        const stock = parseInt(document.getElementById('inv-stock').value);
        const minStock = parseInt(document.getElementById('inv-minStock').value);
        
        const newItem = {
            id: Math.max(...mockData.inventory.map(i => i.id)) + 1,
            name: document.getElementById('inv-name').value,
            stock: stock,
            unit: document.getElementById('inv-unit').value,
            minStock: minStock,
            status: stock < minStock ? '要補充' : '正常',
            consumption: parseInt(document.getElementById('inv-consumption').value)
        };
        
        mockData.inventory.push(newItem);
        closeModal();
        renderContent('inventory');
        showNotification('食材を追加しました', 'success');
    });
}

function editInventoryItem(id) {
    const item = mockData.inventory.find(i => i.id === id);
    if (!item) return;
    
    openModal('食材編集', `
        <div class="form-group">
            <label class="form-label">食材名</label>
            <input type="text" id="inv-name" class="form-input" value="${item.name}" required>
        </div>
        <div class="form-group">
            <label class="form-label">現在庫</label>
            <input type="number" id="inv-stock" class="form-input" value="${item.stock}" required>
        </div>
        <div class="form-group">
            <label class="form-label">単位</label>
            <input type="text" id="inv-unit" class="form-input" value="${item.unit}" required>
        </div>
        <div class="form-group">
            <label class="form-label">最小在庫</label>
            <input type="number" id="inv-minStock" class="form-input" value="${item.minStock}" required>
        </div>
        <div class="form-group">
            <label class="form-label">1日消費量</label>
            <input type="number" id="inv-consumption" class="form-input" value="${item.consumption}" required>
        </div>
    `, () => {
        const stock = parseInt(document.getElementById('inv-stock').value);
        const minStock = parseInt(document.getElementById('inv-minStock').value);
        
        item.name = document.getElementById('inv-name').value;
        item.stock = stock;
        item.unit = document.getElementById('inv-unit').value;
        item.minStock = minStock;
        item.status = stock < minStock ? '要補充' : '正常';
        item.consumption = parseInt(document.getElementById('inv-consumption').value);
        
        closeModal();
        renderContent('inventory');
        showNotification('食材を更新しました', 'success');
        
        if (item.status === '要補充') {
            showNotification(`警告: ${item.name}の在庫が不足しています`, 'warning');
        }
    });
}

function deleteInventoryItem(id) {
    confirm('この食材を削除しますか？', () => {
        const index = mockData.inventory.findIndex(i => i.id === id);
        if (index !== -1) {
            mockData.inventory.splice(index, 1);
            renderContent('inventory');
            showNotification('食材を削除しました', 'success');
        }
    });
}

function renderStaff() {
    let html = `
        <div class="toolbar">
            <div class="search-box">
                <input type="text" class="search-input" placeholder="スタッフを検索..." value="${currentSearchTerm}">
                <select class="filter-select" onchange="filterStaff(this.value)">
                    <option value="">全役職</option>
                    <option value="店長">店長</option>
                    <option value="マネージャー">マネージャー</option>
                    <option value="キッチン">キッチン</option>
                    <option value="カウンター">カウンター</option>
                    <option value="デリバリー">デリバリー</option>
                </select>
            </div>
            <div class="action-buttons">
                <button class="btn btn-success" onclick="addStaff()">+ 新規追加</button>
                <button class="btn btn-primary" onclick="exportToCSV(mockData.staff, 'staff')">エクスポート</button>
            </div>
        </div>
    `;
    
    let filtered = filterData(mockData.staff, currentFilters.staff || {}, currentSearchTerm);
    let paginated = paginateData(filtered, currentPage, itemsPerPage);
    
    const staffHTML = paginated.map(staff => {
        const perfColor = staff.performance >= 90 ? '#10B981' : staff.performance >= 80 ? '#FBBF24' : '#EF4444';
        return `
        <tr>
            <td class="font-medium">${staff.name}</td>
            <td><span class="badge badge-open">${staff.position}</span></td>
            <td>${staff.hours}時間</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="background: #3f3f3f; border-radius: 0.25rem; height: 1.5rem; flex: 1; overflow: hidden;">
                        <div style="background: ${perfColor}; height: 100%; width: ${staff.performance}%; transition: width 0.3s;"></div>
                    </div>
                    <span style="color: ${perfColor}; font-weight: bold; min-width: 3rem;">${staff.performance}%</span>
                </div>
            </td>
            <td>${staff.shift}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn btn-primary btn-small btn-icon" onclick="editStaff(${staff.id})">編集</button>
                    <button class="btn btn-danger btn-small btn-icon" onclick="deleteStaff(${staff.id})">削除</button>
                </div>
            </td>
        </tr>
    `}).join('');
    
    html += `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>スタッフ名</th>
                        <th>役職</th>
                        <th>今月の勤務時間</th>
                        <th>パフォーマンス</th>
                        <th>シフト時間</th>
                        <th>操作</th>
                    </tr>
                </thead>
                <tbody>
                    ${staffHTML}
                </tbody>
            </table>
        </div>
    `;
    
    html += createPagination(filtered.length, currentPage, itemsPerPage, 'changePage');
    return html;
}

function filterStaff(position) {
    if (!currentFilters.staff) currentFilters.staff = {};
    currentFilters.staff.position = position || undefined;
    currentPage = 1;
    renderContent('staff');
}

function renderReviews() {
    const avgRating = (mockData.reviews.reduce((sum, r) => sum + r.rating, 0) / mockData.reviews.length).toFixed(1);
    const complaints = mockData.reviews.filter(r => r.type === '苦情').length;
    const pending = mockData.reviews.filter(r => r.status === '対応中').length;
    
    let html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div class="restaurant-card" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);">
                <h3 style="color: #000; font-size: 0.875rem; margin-bottom: 0.5rem;">平均評価</h3>
                <p style="color: #000; font-size: 2rem; font-weight: bold;">${avgRating} ★</p>
            </div>
            <div class="restaurant-card">
                <h3 style="color: #ffffff; font-size: 0.875rem; margin-bottom: 0.5rem;">総レビュー数</h3>
                <p style="color: #F59E0B; font-size: 2rem; font-weight: bold;">${mockData.reviews.length}件</p>
            </div>
            <div class="restaurant-card">
                <h3 style="color: #ffffff; font-size: 0.875rem; margin-bottom: 0.5rem;">苦情件数</h3>
                <p style="color: ${complaints > 0 ? '#EF4444' : '#10B981'}; font-size: 2rem; font-weight: bold;">${complaints}件</p>
            </div>
            <div class="restaurant-card">
                <h3 style="color: #ffffff; font-size: 0.875rem; margin-bottom: 0.5rem;">未対応</h3>
                <p style="color: ${pending > 0 ? '#FBBF24' : '#10B981'}; font-size: 2rem; font-weight: bold;">${pending}件</p>
            </div>
        </div>
        
        <div class="toolbar">
            <div class="search-box">
                <input type="text" class="search-input" placeholder="レビューを検索..." value="${currentSearchTerm}">
                <select class="filter-select" onchange="filterReviews('type', this.value)">
                    <option value="">全種類</option>
                    <option value="評価">評価</option>
                    <option value="苦情">苦情</option>
                </select>
                <select class="filter-select" onchange="filterReviews('status', this.value)">
                    <option value="">全ステータス</option>
                    <option value="対応中">対応中</option>
                    <option value="対応済み">対応済み</option>
                </select>
            </div>
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="exportToCSV(mockData.reviews, 'reviews')">エクスポート</button>
            </div>
        </div>
    `;
    
    let filtered = filterData(mockData.reviews, currentFilters.reviews || {}, currentSearchTerm);
    let paginated = paginateData(filtered, currentPage, itemsPerPage);
    
    const reviewsHTML = paginated.map(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const statusClass = review.status === '対応済み' ? 'badge-open' : 'badge-cooking';
        const typeClass = review.type === '苦情' ? 'badge-delivering' : 'badge-open';
        return `
        <tr onclick="viewReviewDetail(${review.id})" style="cursor: pointer;">
            <td class="font-medium">${review.user}</td>
            <td style="color: #F59E0B;">${stars}</td>
            <td style="max-width: 300px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${review.comment}</td>
            <td>${review.date}</td>
            <td><span class="badge ${typeClass}">${review.type}</span></td>
            <td><span class="badge ${statusClass}">${review.status}</span></td>
        </tr>
    `}).join('');
    
    html += `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>顧客名</th>
                        <th>評価</th>
                        <th>コメント</th>
                        <th>日付</th>
                        <th>種類</th>
                        <th>ステータス</th>
                    </tr>
                </thead>
                <tbody>
                    ${reviewsHTML}
                </tbody>
            </table>
        </div>
    `;
    
    html += createPagination(filtered.length, currentPage, itemsPerPage, 'changePage');
    return html;
}

function filterReviews(key, value) {
    if (!currentFilters.reviews) currentFilters.reviews = {};
    currentFilters.reviews[key] = value || undefined;
    currentPage = 1;
    renderContent('reviews');
}

function viewReviewDetail(id) {
    const review = mockData.reviews.find(r => r.id === id);
    if (!review) return;
    
    const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
    
    openModal('レビュー詳細', `
        <div style="padding: 1rem; background: #3f3f3f; border-radius: 0.5rem; margin-bottom: 1rem;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 0.5rem;">
                <span style="color: #ffffff; font-weight: bold;">${review.user}</span>
                <span style="color: #F59E0B; font-size: 1.25rem;">${stars}</span>
            </div>
            <div style="color: #9CA3AF; font-size: 0.875rem; margin-bottom: 1rem;">
                ${review.date} | ${review.type}
            </div>
            <p style="color: #ffffff; line-height: 1.6;">${review.comment}</p>
        </div>
        <div class="form-group">
            <label class="form-label">ステータス</label>
            <select id="review-status" class="form-select">
                <option value="対応中" ${review.status === '対応中' ? 'selected' : ''}>対応中</option>
                <option value="対応済み" ${review.status === '対応済み' ? 'selected' : ''}>対応済み</option>
            </select>
        </div>
    `, () => {
        review.status = document.getElementById('review-status').value;
        closeModal();
        renderContent('reviews');
        showNotification('ステータスを更新しました', 'success');
    });
}

function renderDelivery() {
    const activeDrivers = mockData.delivery.filter(d => d.status === '配達中').length;
    const totalOrders = mockData.delivery.reduce((sum, d) => sum + d.orders, 0);
    const avgEfficiency = (mockData.delivery.reduce((sum, d) => sum + d.efficiency, 0) / mockData.delivery.length).toFixed(1);
    
    let html = `
        <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 1.5rem;">
            <div class="restaurant-card" style="background: linear-gradient(135deg, #F59E0B 0%, #D97706 100%);">
                <h3 style="color: #000; font-size: 0.875rem; margin-bottom: 0.5rem;">配達中のドライバー</h3>
                <p style="color: #000; font-size: 2rem; font-weight: bold;">${activeDrivers}人</p>
            </div>
            <div class="restaurant-card">
                <h3 style="color: #ffffff; font-size: 0.875rem; margin-bottom: 0.5rem;">配達中の注文</h3>
                <p style="color: #F59E0B; font-size: 2rem; font-weight: bold;">${totalOrders}件</p>
            </div>
            <div class="restaurant-card">
                <h3 style="color: #ffffff; font-size: 0.875rem; margin-bottom: 0.5rem;">平均効率</h3>
                <p style="color: ${avgEfficiency >= 90 ? '#10B981' : '#FBBF24'}; font-size: 2rem; font-weight: bold;">${avgEfficiency}%</p>
            </div>
        </div>
        
        <div class="toolbar">
            <div class="search-box">
                <input type="text" class="search-input" placeholder="ドライバーを検索..." value="${currentSearchTerm}">
                <select class="filter-select" onchange="filterDelivery(this.value)">
                    <option value="">全ステータス</option>
                    <option value="配達中">配達中</option>
                    <option value="待機中">待機中</option>
                    <option value="休憩中">休憩中</option>
                </select>
            </div>
            <div class="action-buttons">
                <button class="btn btn-primary" onclick="exportToCSV(mockData.delivery, 'delivery')">エクスポート</button>
            </div>
        </div>
    `;
    
    let filtered = filterData(mockData.delivery, currentFilters.delivery || {}, currentSearchTerm);
    let paginated = paginateData(filtered, currentPage, itemsPerPage);
    
    const deliveryHTML = paginated.map(driver => {
        const statusBadge = {
            '配達中': 'badge-cooking',
            '待機中': 'badge-open',
            '休憩中': 'badge-confirmed'
        };
        const effColor = driver.efficiency >= 90 ? '#10B981' : driver.efficiency >= 80 ? '#FBBF24' : '#EF4444';
        return `
        <tr>
            <td class="font-medium">${driver.driver}</td>
            <td><span class="badge ${statusBadge[driver.status]}">${driver.status}</span></td>
            <td style="text-align: center; font-weight: bold; color: #F59E0B;">${driver.orders}件</td>
            <td>${driver.location}</td>
            <td style="max-width: 250px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;">${driver.route}</td>
            <td>
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <div style="background: #3f3f3f; border-radius: 0.25rem; height: 1.5rem; flex: 1; overflow: hidden;">
                        <div style="background: ${effColor}; height: 100%; width: ${driver.efficiency}%; transition: width 0.3s;"></div>
                    </div>
                    <span style="color: ${effColor}; font-weight: bold; min-width: 3rem;">${driver.efficiency}%</span>
                </div>
            </td>
            <td>${driver.time}</td>
        </tr>
    `}).join('');
    
    html += `
        <div class="data-table">
            <table>
                <thead>
                    <tr>
                        <th>ドライバー名</th>
                        <th>ステータス</th>
                        <th>配達中の注文</th>
                        <th>現在地</th>
                        <th>配達ルート</th>
                        <th>配達効率</th>
                        <th>推定時間</th>
                    </tr>
                </thead>
                <tbody>
                    ${deliveryHTML}
                </tbody>
            </table>
        </div>
    `;
    
    html += createPagination(filtered.length, currentPage, itemsPerPage, 'changePage');
    return html;
}

function filterDelivery(status) {
    if (!currentFilters.delivery) currentFilters.delivery = {};
    currentFilters.delivery.status = status || undefined;
    currentPage = 1;
    renderContent('delivery');
}

const subTabs = {
    'products': [
        { id: 'menu', label: 'メニュー一覧' }
    ],
    'orders-delivery': [
        { id: 'orders', label: '注文管理' },
        { id: 'delivery', label: '配送管理' }
    ],
    'operations': [
        { id: 'restaurants', label: '店舗管理' },
        { id: 'inventory', label: '在庫管理' },
        { id: 'staff', label: 'スタッフ管理' }
    ],
    'customer-service': [
        { id: 'users', label: '顧客管理' },
        { id: 'reviews', label: 'レビュー管理' }
    ]
};

let currentMainTab = 'dashboard';
let currentSubTab = null;

function showSubTabs(mainTab) {
    const subTabNav = document.getElementById('sub-tab-navigation');
    const subTabContainer = subTabNav.querySelector('.sub-tab-container');
    
    if (subTabs[mainTab]) {
        subTabNav.style.display = 'block';
        subTabContainer.innerHTML = subTabs[mainTab].map(tab => `
            <button class="sub-tab-button ${tab.id === currentSubTab ? 'active' : ''}" data-subtab="${tab.id}">
                ${tab.label}
            </button>
        `).join('');
        
        subTabContainer.querySelectorAll('.sub-tab-button').forEach(button => {
            button.addEventListener('click', () => {
                switchSubTab(button.dataset.subtab);
            });
        });
        
        if (!currentSubTab || !subTabs[mainTab].find(t => t.id === currentSubTab)) {
            switchSubTab(subTabs[mainTab][0].id);
        }
    } else {
        subTabNav.style.display = 'none';
        currentSubTab = null;
    }
}

function switchSubTab(subTabName) {
    currentSubTab = subTabName;
    
    currentSearchTerm = '';
    currentPage = 1;
    
    document.querySelectorAll('.sub-tab-button').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.subtab === subTabName) {
            button.classList.add('active');
        }
    });
    
    renderContent(subTabName);
}

function renderContent(tabName) {
    const contentArea = document.getElementById('content-area');
    switch (tabName) {
        case 'menu':
            contentArea.innerHTML = renderMenu();
            break;
        case 'orders':
            contentArea.innerHTML = renderOrders();
            break;
        case 'restaurants':
            contentArea.innerHTML = renderRestaurants();
            break;
        case 'users':
            contentArea.innerHTML = renderUsers();
            break;
        case 'dashboard':
            contentArea.innerHTML = renderDashboard();
            break;
        case 'inventory':
            contentArea.innerHTML = renderInventory();
            break;
        case 'staff':
            contentArea.innerHTML = renderStaff();
            break;
        case 'reviews':
            contentArea.innerHTML = renderReviews();
            break;
        case 'delivery':
            contentArea.innerHTML = renderDelivery();
            break;
    }
}

function switchTab(tabName) {
    currentMainTab = tabName;
    
    currentSearchTerm = '';
    currentPage = 1;
    currentSort = { column: null, direction: 'asc' };
    
    document.querySelectorAll('.tab-button').forEach(button => {
        button.classList.remove('active');
        if (button.dataset.tab === tabName) {
            button.classList.add('active');
        }
    });
    
    showSubTabs(tabName);
    
    if (tabName === 'dashboard') {
        renderContent('dashboard');
    }
}

document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.tab-button').forEach(button => {
        button.addEventListener('click', () => {
            switchTab(button.dataset.tab);
        });
    });
    
    const contentArea = document.getElementById('content-area');
    
    contentArea.addEventListener('input', (e) => {
        if (e.target.classList.contains('search-input')) {
            const currentTab = currentSubTab || currentMainTab;
            currentSearchTerm = e.target.value;
            currentPage = 1;
            
            if (searchTimer) clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                renderContent(currentTab);
            }, 300);
        }
    });
    
    contentArea.addEventListener('change', (e) => {
        if (e.target.classList.contains('filter-select')) {
            e.target.onchange && e.target.onchange();
        }
    });
    
    switchTab('dashboard');
});