# Menggunakan image resmi Node.js sebagai base image
FROM node:22-alpine

# Set working directory dalam container
WORKDIR /app

# Menyalin package.json dan package-lock.json (jika ada) untuk instalasi dependencies
COPY package*.json ./

# Install dependencies
RUN npm install

# Menyalin seluruh file proyek ke dalam container
COPY . .

# Meng expose port yang akan digunakan oleh aplikasi
EXPOSE 5000

# Menjalankan aplikasi saat container dijalankan
CMD ["npm", "start"]
