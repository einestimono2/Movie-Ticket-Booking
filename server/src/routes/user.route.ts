import express from 'express';

import { userController } from '../controllers';
import { authorizeRoles, isAuthenticated } from '../middlewares';
import { Roles } from '../constants';

const router = express.Router();

//! .../api/v1/user

router.get('/list', isAuthenticated, authorizeRoles(Roles.Admin), userController.getUsers);

router.get('/toggle-block/:id', isAuthenticated, authorizeRoles(Roles.Admin), userController.toggleBlock);

router.get('/favorite/movie/:id', isAuthenticated, userController.toggleFavoriteMovie);
router.get('/favorite/theater/:id', isAuthenticated, userController.toggleFavoriteTheater);
router.get('/favorite/my-favorite', isAuthenticated, userController.myFavorite);

router
  .route('/me')
  .get(isAuthenticated, userController.getProfile)
  .patch(isAuthenticated, userController.updateProfile);

router.patch('/avatar', isAuthenticated, userController.updateAvatar);

router.patch('/update-password', isAuthenticated, userController.updatePassword);

export const userRouter = router;

//! Danh sách người dùng
/**
 * @swagger
 * /user/list:
 *  get:
 *    tags: [User]
 *    summary: "[Admin] Danh sách người dùng"
 *    security:
 *      - BearerToken: []
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *      - in: query
 *        name: keyword
 *        type: string
 *        description: Tìm theo tên
 *      - in: query
 *        name: page
 *        type: string
 *        description: Trang hiện tại
 *      - in: query
 *        name: limit
 *        type: string
 *        description: Số lượng kết quả mỗi trang
 *      - in: query
 *        name: sort
 *        type: string
 *        hint: ht
 *        description: Sắp xếp (\+fullName, fullName, \-fullName)
 *      - in: query
 *        name: fields
 *        type: string
 *        description: Giới hạn trường trả về (cách nhau bởi dấu phẩy)
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/ListResponse'
 */

//! Movie - Favorite
/**
 * @swagger
 * /user/favorite/movie/{id}:
 *  get:
 *    tags: [User]
 *    summary: "[User] Yêu thích/Bỏ yêu thích phim"
 *    security:
 *      - BearerToken: []
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *      - in: path
 *        name: id
 *        type: string
 *        description: Movie ID
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! Theater - Favorite
/**
 * @swagger
 * /user/favorite/theater/{id}:
 *  get:
 *    tags: [User]
 *    summary: "[User] Yêu thích/Bỏ yêu thích rạp"
 *    security:
 *      - BearerToken: []
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *      - in: path
 *        name: id
 *        type: string
 *        description: Theater ID
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! My Favorite
/**
 * @swagger
 * /user/favorite/my-favorite:
 *  get:
 *    tags: [User]
 *    summary: "[User] Danh sách yêu thích của tôi"
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *    security:
 *      - BearerToken: []
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! My Profile
/**
 * @swagger
 * /user/me:
 *  get:
 *    tags: [User]
 *    summary: "[User] Lấy thông tin tài khoản"
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *    security:
 *      - BearerToken: []
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! Khóa/Mở khóa tài khoản
/**
 * @swagger
 * /user/toggle-block/{id}:
 *  get:
 *    tags: [User]
 *    summary: "[User] Khóa hoặc mở khóa tài khoản"
 *    security:
 *      - BearerToken: []
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *      - in: path
 *        name: id
 *        type: string
 *        description: User ID
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! Cập nhật avatar
/**
 * @swagger
 * /user/avatar:
 *  patch:
 *    tags: [User]
 *    summary: "[User] Cập nhật avatar người dùng"
 *    security:
 *      - BearerToken: []
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - avatar
 *            properties:
 *              avatar:
 *                type: string
 *                example: ""
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! Cập nhật thông tin tài khoản
/**
 * @swagger
 * /user/me:
 *  patch:
 *    tags: [User]
 *    summary: "[User] Cập nhật thông tin tài khoản"
 *    security:
 *      - BearerToken: []
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *              phoneNumber:
 *                type: string
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! Đổi mật khẩu
/**
 * @swagger
 * /user/update-password:
 *  patch:
 *    tags: [User]
 *    summary: "[User] Thay đổi mật khẩu tài khoản"
 *    security:
 *      - BearerToken: []
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - oldPassword
 *              - newPassword
 *            properties:
 *              oldPassword:
 *                type: string
 *                default: ''
 *              newPassword:
 *                type: string
 *                default: ''
 *
 *        application/x-www-form-urlencoded:
 *          schema:
 *            type: object
 *            required:
 *              - oldPassword
 *              - newPassword
 *            properties:
 *              oldPassword:
 *                type: string
 *              newPassword:
 *                type: string
 *    responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
