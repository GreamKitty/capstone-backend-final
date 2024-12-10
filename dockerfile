# Gunakan image Node.js resmi
FROM node:18

# Set work directory
WORKDIR /app

# Copy package.json dan package-lock.json
COPY . .

# Install dependencies
RUN npm install

# Expose port aplikasi
EXPOSE 9000

# Perintah untuk menjalankan aplikasi
CMD ["npm", "run", "bismillah"]
