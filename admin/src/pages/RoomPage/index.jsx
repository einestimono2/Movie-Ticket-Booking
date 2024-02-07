/* eslint-disable prefer-destructuring */
import { Button, Dropdown, Form, Modal, Select, Spin, Table } from 'antd';
import Input from 'antd/es/input/Input';
import React, { useEffect, useState } from 'react';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import './style.css';
import apiCaller from '../../apis/apiCaller';
import { roomApi } from '../../apis/manager/roomApi';
import ModalDelete from '../../components/ModalDelete';

export default function RoomPage() {
  const [isOpen, setIsOpen] = useState({ open: false, title: '' });
  const [totalSeats, setTotalSeats] = useState(0);
  const [loading, setLoading] = useState(false);
  const [loadingForm, setLoadingForm] = useState(false);
  const [rowSelected, setRowSelected] = useState();
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [loadingTable, setLoadingTable] = useState(false);
  const [isModalOpenDelete, setIsModalOpenDelete] = useState(false);
  const [data, setData] = useState([]);
  const [seats, setSeats] = useState([]);
  const [selected, setSelected] = useState([]);
  const [form] = Form.useForm();
  const initialRows = 5;
  const initialColumns = 5;

  const [matrix, setMatrix] = useState(() => {
    const initialMatrix = [];
    for (let i = 0; i < initialRows; i++) {
      const row = Array.from({ length: initialColumns }, (_, j) => ({
        label: String.fromCharCode(65 + i) + (j + 1),
        type: 'Standard',
      }));
      initialMatrix.push(row);
    }
    return initialMatrix;
  });

  const addRow = () => {
    const newRow = Array.from({ length: matrix[0]?.length || initialColumns }, (_, j) => ({
      label: String.fromCharCode(65 + matrix.length) + (j + 1),
      type: 'Standard',
    }));
    setMatrix((prevMatrix) => [...prevMatrix, newRow]);
  };

  const addColumn = () => {
    setMatrix((prevMatrix) => {
      const newColumn = Array.from({ length: prevMatrix.length || initialRows }, (_, i) => ({
        label: String.fromCharCode(65 + i) + (prevMatrix[0].length + 1),
        type: 'Standard',
      }));
      const newMatrix = prevMatrix.map((row, index) => [...row, newColumn[index]]);
      return newMatrix;
    });
  };

  const deleteLastRow = () => {
    setMatrix((prevMatrix) => prevMatrix.slice(0, -1));
  };

  const deleteLastColumn = () => {
    setMatrix((prevMatrix) => prevMatrix.map((row) => row.slice(0, -1)));
  };
  console.log(rowSelected);
  const getTotalSeats = () => {
    let _totalSeats = 0;

    matrix.forEach((row) => {
      _totalSeats += row.length;
    });

    return _totalSeats;
  };
  const deleteRoom = async () => {
    setDeleteLoading(true);
    const response = await apiCaller({
      request: roomApi.deleteRoom(rowSelected),
      errorHandler,
    });
    if (response) {
      setIsModalOpenDelete(false);
      toast.success('Xóa phòng thành công!');
      setDeleteLoading(false);
      listRoom();
    }
  };
  const getDetailRoom = async () => {
    setLoadingForm(true);
    const response = await apiCaller({
      request: roomApi.roomDetails(rowSelected),
      errorHandler,
    });
    if (response) {
      setLoadingForm(false);
      const rows = response.data.seats.reduce((acc, seat) => {
        const rowIndex = seat.coordinates[0];
        if (!acc[rowIndex]) {
          acc[rowIndex] = [];
        }
        acc[rowIndex].push(seat);
        return acc;
      }, []);

      setMatrix(rows);

      setSeats(response.data.seats);
      form.setFieldsValue({
        name: response.data.name,
        type: response.data.type,
      });
    }
  };
  useEffect(() => {
    if (isOpen.type === 'edit') {
      getDetailRoom();
    }
  }, [isOpen.title]);
  useEffect(() => {
    const _totalSeats = getTotalSeats();
    setTotalSeats(_totalSeats);
  }, [matrix]);

  const columns = [
    {
      title: 'STT',
      dataIndex: 'key',
    },
    {
      title: 'Tên phòng',
      dataIndex: 'name',
    },
    {
      title: 'Loại phòng',
      dataIndex: 'type',
    },
    {
      title: 'Số ghế',
      dataIndex: 'capacity',
    },
    {
      title: 'Thao tác',
      dataIndex: 'key',
      render: (text) => {
        return (
          <div>
            <DeleteOutlined
              style={{ color: 'red', fontSize: '30px', cursor: 'pointer' }}
              onClick={() => setIsModalOpenDelete(true)}
            />
            <EditOutlined
              style={{ color: 'orange', fontSize: '30px', cursor: 'pointer' }}
              onClick={() => setIsOpen({ open: true, type: 'edit' })}
            />
          </div>
        );
      },
    },
  ];
  const dataTable = data.map((val, index) => {
    return {
      _id: val._id,
      key: index + 1,
      name: val.name,
      type: val.type,
      capacity: val.capacity,
    };
  });
  const openModal = () => {
    setIsOpen({ open: true, title: 'create' });
  };
  const cancelModal = () => {
    setIsOpen({ open: false, title: '' });
    form.resetFields();
  };
  const items = [
    {
      label: 'VIP',
      key: '1',
    },
    {
      label: 'Standard',
      key: '2',
    },
    {
      label: 'Sweetbox',
      key: '3',
    },
  ];
  const itemsType = [
    {
      label: '2D',
      value: '2D',
    },
    {
      label: '3D',
      value: '3D',
    },
  ];
  const errorHandler = (error) => {
    console.log(error);
  };
  const onFinish = async (values) => {
    const body = {
      seats: matrix,
      capacity: totalSeats,
      name: values.name,
      type: values.type,
    };
    try {
      setLoading(true);
      const response = await apiCaller({
        request: isOpen.title === 'create' ? roomApi.createRoom(body) : roomApi.updateRoom(rowSelected, body),
        errorHandler,
      });
      if (response) {
        setLoading(false);
        setIsOpen({ open: false, title: '' });
        toast.success(isOpen.title === 'create' ? 'Create Room Successful!' : 'Update Room Successful!');
        form.resetFields();
        listRoom();
      }
    } catch (error) {
      setLoading(false);
    }
  };
  const handleMenuClick = (e) => {
    const label = items.filter((item) => item.key === e.key)?.[0]?.label;
    if (matrix[selected[0]][selected[1]].type === label) return;
    matrix[selected[0]][selected[1]].type = label;
    setMatrix([...matrix]);
  };

  const menuProps = {
    items,
    onClick: (e, cell, rowIndex, columnIndex) => handleMenuClick(e, rowIndex, columnIndex),
  };

  const listRoom = async () => {
    setLoadingTable(true);
    const response = await apiCaller({
      request: roomApi.listRoom(),
      errorHandler,
    });
    if (response) {
      setLoadingTable(false);
      setData(response.data);
    }
  };
  useEffect(() => {
    listRoom();
  }, []);
  return (
    <div>
      <div className="flex justify-between">
        <p className="text-3xl font-bold mt-0">DANH SÁCH PHÒNG</p>
        <Button onClick={openModal} type="primary">
          + Thêm mới
        </Button>
      </div>
      <div>
        <Table
          loading={loadingTable}
          bordered
          columns={columns}
          dataSource={dataTable}
          onRow={(record, rowIndex) => {
            return {
              onClick: (event) => {
                setRowSelected(record._id);
              },
            };
          }}
        />
      </div>

      <Modal
        className="max-w-[90%] !w-fit  !-mt-14"
        footer={null}
        title={isOpen.title === 'create' ? 'Tạo phòng' : 'Sửa Phòng'}
        open={isOpen.open}
        onCancel={cancelModal}
      >
        {loadingForm ? (
          <Spin size="large" />
        ) : (
          <Form form={form} onFinish={onFinish}>
            <div className="">
              <div className="grid grid-cols-6 gap-4">
                <Form.Item
                  name="name"
                  rules={[{ required: true, message: 'Please input your name!' }]}
                  label="Name"
                  className="col-span-3"
                >
                  <Input />
                </Form.Item>
                <Form.Item
                  name="type"
                  rules={[{ required: true, message: 'Please input your type!' }]}
                  label="Type"
                  className="col-span-2"
                >
                  <Select placeholder="Select a type" options={itemsType} />
                </Form.Item>
                <Form.Item label="Capacity" className="col-span-1">
                  {totalSeats}
                </Form.Item>
              </div>
              <div className="grid grid-cols-6 gap-5">
                <div className=" col-span-5 mt-6 flex items-center flex-col container-screen">
                  <div className="bg-black h-12 w-[90%] flex items-center justify-center text-2xl font-bold shadow-xl screen">
                    <div className="bg-white h-[95%] w-[95%] flex items-center justify-around text-2xl font-bold shadow-xl screen">
                      <div className="flex items-center">
                        <div className="bg-gray-200 w-[40px]  h-[25px]  rounded-t-2xl" />
                        <span className="ml-3"> Standard</span>
                      </div>
                      <div className="flex items-center ">
                        <div className="bg-red-400 w-[40px]  h-[25px]  rounded-t-2xl" />
                        <span className="ml-3"> VIP</span>
                      </div>
                      <div className="flex items-center ">
                        <div className="bg-pink-300 w-[40px]  h-[25px]  rounded-t-2xl" />
                        <span className="ml-3"> Sweetbox</span>
                      </div>
                    </div>
                  </div>
                  <div className="!max-w-[820px] overflow-auto min-w-[270px] min-h-[240px] mt-16 !max-h-[360px]">
                    <table>
                      <tbody>
                        {matrix.map((row, rowIndex) => (
                          <tr key={rowIndex}>
                            {row.map((cell, columnIndex) => (
                              <td key={columnIndex} className="p-1">
                                <Dropdown menu={menuProps} trigger={['click']}>
                                  <div
                                    onClick={() => {
                                      setSelected([rowIndex, columnIndex]);
                                    }}
                                    className={`${
                                      cell.type === 'VIP'
                                        ? 'bg-red-400'
                                        : cell.type === 'Standard'
                                          ? 'bg-gray-200'
                                          : 'bg-pink-300'
                                    }  p-2 ${
                                      cell.type === 'Sweetbox' ? 'w-14' : 'w-7'
                                    }  cursor-pointer seat text-center m-auto   rounded-t-2xl`}
                                  >
                                    {cell.label}
                                  </div>
                                </Dropdown>
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <div />
                </div>
                <div className="col-span-1  ">
                  <div className="flex justify-between h-full flex-col items-center">
                    <div className="grid grid-rows-5 gap-5">
                      <Button onClick={addRow}>Add Row</Button>
                      <Button onClick={addColumn}>Add Column</Button>
                      {matrix.length > 0 && (
                        <>
                          <Button onClick={deleteLastRow}>Delete Row</Button>
                          <Button onClick={deleteLastColumn}>Delete Column</Button>
                        </>
                      )}
                    </div>
                    <Form.Item className="mb-0">
                      <Button loading={loading} type="primary" htmlType="submit">
                        Submit
                      </Button>
                    </Form.Item>
                  </div>
                </div>
              </div>
            </div>
          </Form>
        )}
      </Modal>
      <ToastContainer />
      <ModalDelete
        title="Xóa mã giảm giá"
        open={isModalOpenDelete}
        onCancel={() => setIsModalOpenDelete(false)}
        okButtonProps={{ loading: deleteLoading }}
        onOk={deleteRoom}
      >
        <div>Bạn có chắc xóa mã giảm giá này không?</div>
      </ModalDelete>
    </div>
  );
}
