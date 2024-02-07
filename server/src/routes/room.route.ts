import express from 'express';

import { isAuthenticated, authorizeRoles } from '../middlewares';
import { Roles } from '../constants';
import { roomController } from '../controllers';

const router = express.Router();
const adminRoles = [Roles.Manager, Roles.Admin];

//! .../api/v1/room

// [POST] Add Room
router.post('/create', isAuthenticated, authorizeRoles(...adminRoles), roomController.createRoom);

// // [GET] All Rooms
// router.get('/list', isAuthenticated, authorizeRoles(Roles.Admin), roomController.getRooms);

// [GET] Rooms Of Theater
router.get('/list-by-theater/:id', roomController.getRoomsByTheater);

// [POST] List Seat
router.post('/list-seat', roomController.getSeatListWithStatus);

// [GET] Rooms Of Theater
router.get('/my-theater', isAuthenticated, authorizeRoles(...adminRoles), roomController.getMyTheaterRooms);

// [PUT] Update Room
router.put('/details/:id', isAuthenticated, authorizeRoles(...adminRoles), roomController.updateRoom);

// [DELETE] Delete Room
router.delete('/details/:id', isAuthenticated, authorizeRoles(...adminRoles), roomController.deleteRoom);

// [GET] Room Details
router.get('/details/:id', roomController.getRoomDetails);

export const roomRouter = router;

//! Create Room
/**
 * @swagger
 * /room/create:
 *  post:
 *    tags: [Room]
 *    summary: "[Manager] Tạo phòng chiếu"
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
 *              - type
 *              - name
 *              - capacity
 *            properties:
 *              name:
 *                type: string
 *                default: ""
 *              capacity:
 *                type: number
 *              type:
 *                type: string
 *                description: "2D | 3D"
 *                "enum": [ "2D", "3D"]
 *              seats:
 *                type: array
 *                items:
 *                  type: object
 *                  required:
 *                    - type
 *                    - label
 *                    - coordinates
 *                  properties:
 *                    type:
 *                      type: string
 *                    label:
 *                      type: string
 *                    coordinates:
 *                      type: array
 *                example:
 *                  - type: "Standard"
 *                    label: "A1"
 *                    coordinates: [0,0]
 *                  - type: "Standard"
 *                    label: "A2"
 *                    coordinates: [0,1]
 *    responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! Rooms Of Theater
/**
 * @swagger
 * /room/list-by-theater/{id}:
 *  get:
 *    tags: [Room]
 *    summary: "[All] Lấy danh sách phòng của rạp"
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *      - in: path
 *        name: id
 *        type: string
 *        required: true
 *        description: Theater ID
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! Rooms Of My Theater
/**
 * @swagger
 * /room/my-theater:
 *  get:
 *    tags: [Room]
 *    summary: "[Manager] Lấy danh sách phòng của rạp"
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

//! Seat List
/**
 * @swagger
 * /room/list-seat:
 *  post:
 *    tags: [Room]
 *    summary: "[All] Lấy danh sách ghế ngồi với trạng thái của từng ghế (được đặt hay chưa)"
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *    security:
 *      - BearerToken: []
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            required:
 *              - room
 *              - showtime
 *            properties:
 *              room:
 *                type: string
 *                default: ""
 *              showtime:
 *                type: string
 *                default: ""
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! Lấy thông tin phòng
/**
 * @swagger
 * /room/details/{id}:
 *  get:
 *    tags: [Room]
 *    summary: "[All] Thông tin phòng + DS ghế"
 *    parameters:
 *      - in: query
 *        name: hl
 *        type: string
 *        default: vi
 *        description: Ngôn ngữ trả về 'en | vi'
 *      - in: path
 *        name: id
 *        type: string
 *        required: true
 *        description: Room ID
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! Update Room
/**
 * @swagger
 * /room/details/{id}:
 *  put:
 *    tags: [Room]
 *    summary: "[Manager] Cập nhật phòng chiếu"
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
 *        required: true
 *        description: Theater ID
 *    requestBody:
 *      required: true
 *      content:
 *        application/json:
 *          schema:
 *            type: object
 *            properties:
 *              name:
 *                type: string
 *                default: ""
 *              capacity:
 *                type: number
 *              type:
 *                type: string
 *                description: "2D | 3D"
 *                "enum": [ "2D", "3D"]
 *              isActive:
 *                type: boolean
 *                default: true
 *              seats:
 *                type: array
 *                items:
 *                  type: object
 *                  required:
 *                    - type
 *                    - label
 *                    - coordinates
 *                  properties:
 *                    type:
 *                      type: string
 *                    label:
 *                      type: string
 *                    coordinates:
 *                      type: array
 *                example: []
 *    responses:
 *      201:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */

//! Delete Room
/**
 * @swagger
 * /room/details/{id}:
 *  delete:
 *    tags: [Room]
 *    summary: "[Manager] Xóa phòng chiếu"
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
 *        required: true
 *        description: Theater ID
 *    responses:
 *      200:
 *        description: Success
 *        content:
 *          application/json:
 *            schema:
 *              $ref: '#/components/schemas/Response'
 */
