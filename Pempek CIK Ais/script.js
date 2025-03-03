document.addEventListener("DOMContentLoaded", function () {
    let cart = JSON.parse(localStorage.getItem("cart")) || [];
    let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];

    function renderMenu() {
        const menuList = document.getElementById("menu-list");
        if (!menuList) return;

        menuList.innerHTML = "";
        const menuItems = [
            { name: "Pempek Kapal Selam Besar", price: 15000, image: "images/pempek_kapal_selam.png" },
            { name: "Pempek Kapal Selam Kecil", price: 10000, image: "images/pempek_kapal_selam.png" },
            { name: "Pempek Lenjer", price: 10000, image: "images/pempek_lenjer.png" },
            { name: "Pempek Adaan", price: 12000, image: "images/pempek_adaan.png" },
            { name: "Pempek Kulit", price: 8000, image: "images/pempek_kulit.png" }
        ];

        menuItems.forEach(item => {
            const menuItem = document.createElement("div");
            menuItem.classList.add("menu-item");
            menuItem.innerHTML = `
                <img src="${item.image}" alt="${item.name}">
                <h3>${item.name}</h3>
                <p>Rp ${item.price.toLocaleString()}</p>
                <input type="number" min="1" value="1" class="quantity">
                <button class="add-to-cart">Tambah ke Keranjang</button>
            `;
            menuList.appendChild(menuItem);
        });
    }

    document.addEventListener("click", (e) => {
        if (e.target.classList.contains("add-to-cart")) {
            const product = e.target.closest(".menu-item");
            const productName = product.querySelector("h3").innerText;
            const productPrice = parseInt(product.querySelector("p").innerText.replace("Rp ", "").replace(".", ""));
            const productQuantity = parseInt(product.querySelector(".quantity").value);

            if (productQuantity < 1) {
                alert("Jumlah harus minimal 1!");
                return;
            }

            let existingItem = cart.find(item => item.name === productName);
            if (existingItem) {
                existingItem.quantity += productQuantity;
            } else {
                cart.push({ name: productName, price: productPrice, quantity: productQuantity });
            }

            alert(`${productQuantity} ${productName} telah ditambahkan ke keranjang!`);
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
        }
    });

    function renderCart() {
        const cartList = document.getElementById("cart-list");
        const totalHargaElem = document.getElementById("total-harga");
        if (!cartList || !totalHargaElem) return;

        cartList.innerHTML = "";
        let total = 0;
        cart.forEach((item, index) => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.name}</td>
                <td>Rp ${item.price.toLocaleString()}</td>
                <td>${item.quantity}</td>
                <td><button onclick="hapusItem(${index})" class="btn-danger">Hapus</button></td>
            `;
            cartList.appendChild(row);
            total += item.price * item.quantity;
        });
        totalHargaElem.innerText = "Rp " + total.toLocaleString();
    }

    window.hapusItem = function (index) {
        if (confirm("Apakah kamu yakin ingin menghapus item ini?")) {
            cart.splice(index, 1);
            localStorage.setItem("cart", JSON.stringify(cart));
            renderCart();
        }
    };

    document.getElementById("checkout")?.addEventListener("click", () => {
        if (cart.length === 0) {
            alert("Keranjang kosong! Silakan tambahkan item terlebih dahulu.");
            return;
        }

        let metodePembayaran = document.getElementById("metode-pembayaran")?.value || "Tunai";
        let tanggal = new Date().toISOString().split("T")[0]; // 🔹 Pastikan format tanggal untuk filter
        let total = cart.reduce((sum, item) => sum + item.price * item.quantity, 0);

        let newTransaksi = {
            tanggal: tanggal,
            items: cart.map(item => `${item.name} (${item.quantity})`).join(", "),
            total: total,
            status: "Selesai",
            metode: metodePembayaran
        };

        transaksi.push(newTransaksi);
        localStorage.setItem("transaksi", JSON.stringify(transaksi));
        localStorage.removeItem("cart");

        alert("Pembayaran berhasil!");
        renderCart();
        renderRiwayat(); // 🔹 Pastikan daftar transaksi diperbarui
    });

    function renderRiwayat(filterDate = "") {
        const riwayatList = document.getElementById("riwayat-transaksi");
        if (!riwayatList) return;

        riwayatList.innerHTML = "";
        let transaksi = JSON.parse(localStorage.getItem("transaksi")) || [];
        let filteredTransaksi = transaksi.filter(item => {
            let transaksiTanggal = new Date(item.tanggal).toISOString().split("T")[0];
            return filterDate ? transaksiTanggal === filterDate : true;
        });

        if (filteredTransaksi.length === 0) {
            riwayatList.innerHTML = `<tr><td colspan="5" style="text-align: center;">Tidak ada transaksi</td></tr>`;
            return;
        }

        filteredTransaksi.forEach(item => {
            let row = document.createElement("tr");
            row.innerHTML = `
                <td>${item.tanggal}</td>
                <td>${item.items}</td>
                <td>Rp ${item.total.toLocaleString()}</td>
                <td>${item.metode}</td>
                <td>${item.status}</td>
            `;
            riwayatList.appendChild(row);
        });
    }

    function exportToExcel() {
        let transaksiData = JSON.parse(localStorage.getItem("transaksi")) || [];
        if (transaksiData.length === 0) {
            alert("Tidak ada transaksi untuk diekspor!");
            return;
        }

        let tableHeader = ["Tanggal", "Item", "Total", "Metode Pembayaran", "Status"];
        let tableData = transaksiData.map(item => [
            item.tanggal,
            item.items,
            `Rp ${item.total.toLocaleString()}`,
            item.metode,
            item.status
        ]);

        let ws = XLSX.utils.aoa_to_sheet([tableHeader, ...tableData]);
        let wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Transaksi");

        XLSX.writeFile(wb, "Riwayat_Transaksi.xlsx");
        alert("Riwayat transaksi berhasil diekspor!");
    }

    document.getElementById("filter-btn")?.addEventListener("click", function () {
        let filterDate = document.getElementById("filter-date").value;
        renderRiwayat(filterDate);
    });

    document.getElementById("export-excel")?.addEventListener("click", exportToExcel);

    renderMenu();
    renderCart();
    if (document.getElementById("riwayat-transaksi")) {
        renderRiwayat();
    }
});