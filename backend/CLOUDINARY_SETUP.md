# Cloudinary Setup Guide

## 1. Tạo file .env

Tạo file `.env` trong thư mục backend với nội dung sau:

```
# Server Configuration
PORT=5000

# Database Configuration
MONGODB_URI=mongodb://localhost:27017/expense-tracker

# JWT Configuration
JWT_SECRET=your_jwt_secret_key_here

# Client URL for CORS
CLIENT_URL=http://localhost:5173

# Cloudinary Configuration
CLOUDINARY_NAME=davwqqao1
CLOUDINARY_API_KEY=535792523341915
CLOUDINARY_SECRET_KEY=kbJarU4xQKz34IzoJeQY076p8ow
```

## 2. API Endpoint để upload ảnh profile

### Upload/Update Profile Image
- **URL**: `/api/v1/auth/update-profile-image`
- **Method**: `POST`
- **Headers**: 
  - `Authorization`: `Bearer <token>`
- **Body**: Form-data với field `profileImage` chứa file ảnh
- **Response**:
```json
{
  "message": "Profile image updated successfully",
  "profileImageUrl": "https://res.cloudinary.com/..."
}
```

## 3. Cách sử dụng trong Frontend

```javascript
const uploadProfileImage = async (file) => {
  const formData = new FormData();
  formData.append('profileImage', file);
  
  const response = await fetch('http://localhost:5000/api/v1/auth/update-profile-image', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`
    },
    body: formData
  });
  
  const data = await response.json();
  return data;
};
```

## 4. Các tính năng đã thêm

- Upload ảnh profile lên Cloudinary
- Tự động xóa ảnh cũ khi upload ảnh mới
- Giới hạn kích thước file 5MB
- Chỉ chấp nhận các định dạng: JPEG, JPG, PNG, GIF, WEBP
- Ảnh được lưu trong folder `expense-tracker` trên Cloudinary

## 5. Lưu ý

- Đảm bảo đã cài đặt các packages: `cloudinary` và `multer-storage-cloudinary`
- File .env phải được thêm vào .gitignore để không push lên git
- Cloudinary sẽ tự động tối ưu ảnh và cung cấp CDN 