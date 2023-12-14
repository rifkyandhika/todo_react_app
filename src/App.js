import {
	Button,
	Container,
	Text,
	Title,
	Modal,
	TextInput,
	Group,
	Card,
	ActionIcon,
	MantineProvider,
	ColorSchemeProvider,
	Checkbox,
	ColorScheme,
	Code,
} from '@mantine/core';
import { DatePicker } from '@mantine/dates';
import { useState, useRef, useEffect } from 'react';
import { MoonStars, Sun, Trash, Edit } from 'tabler-icons-react';

import Swal from 'sweetalert2';
import { useColorScheme } from '@mantine/hooks';
import { useHotkeys, useLocalStorage } from '@mantine/hooks';

export default function App() {
	const [tasks, setTasks] = useState([]);
	const [taskcompelete, setTasksCompelete] = useState([]);
	const [opened, setOpened] = useState(false);
	const [editingTask, setEditingTask] = useState(null);
	const [isCreateModalOpened, setCreateModalOpened] = useState(false);
	const [isEditModalOpened, setEditModalOpened] = useState(false);

	// Tambahkan state untuk menyimpan data tanggal yang sedang diedit
	const [editingTaskDate, setEditingTaskDate] = useState(new Date());

	const preferredColorScheme = useColorScheme();
	const [colorScheme, setColorScheme] = useLocalStorage({
		key: 'mantine-color-scheme',
		defaultValue: 'light',
		getInitialValueInEffect: true,
	});
	const toggleColorScheme = value =>
		setColorScheme(value || (colorScheme === 'dark' ? 'light' : 'dark'));

	useHotkeys([['mod+J', () => toggleColorScheme()]]);

	const taskTitle = useRef('');
	const taskSummary = useRef('');
	const [taskDate, setTaskDate] = useState(new Date());

	function createTask() {
		const newTask = {
			id: new Date().getTime(), // Gunakan timestamp sebagai ID unik
			title: taskTitle.current.value,
			summary: taskSummary.current.value,
			date: taskDate,
			completed: false,
		};

		setTasks([...tasks, newTask]);
		saveTasks([...tasks, newTask]);
	}

	function editExistingTask(editedTask, taskType) {
		const updatedTasks = taskType === 'tasks' ? [...tasks] : [...taskcompelete];
		const taskIndex = updatedTasks.findIndex(task => task.id === editedTask.id);

		if (taskIndex !== -1) {
			// Lakukan perubahan pada task yang sudah ada
			updatedTasks[taskIndex] = { ...editedTask };

			if (taskType === 'tasks') {
				setTasks(updatedTasks);
				saveTasks(updatedTasks);
			} else {
				setTasksCompelete(updatedTasks);
				saveCompletedTasks(updatedTasks);
			}
		}
	}

	function editTask(index, taskType) {
		const tasksToEdit = taskType === 'tasks' ? tasks : taskcompelete;
		const taskToEdit = tasksToEdit[index];

		if (taskToEdit) {
			// Set data task yang sedang diedit
			setEditingTask(taskToEdit, taskType);

			// Set data tanggal yang sedang diedit
			setEditingTaskDate(taskToEdit.date ? new Date(taskToEdit.date) : new Date());

			// Buka modal
			setEditModalOpened(true);
		}
	}

	function handleTaskCompletion(index) {
		const updatedTasks = [...tasks];
		const completedTask = updatedTasks[index];

		// Ubah properti completed menjadi true
		completedTask.completed = true;

		// Hapus task yang selesai dari tasks
		updatedTasks.splice(index, 1);

		// Pindahkan task yang selesai ke taskcompelete
		setTasksCompelete([...taskcompelete, completedTask]);

		setTasks(updatedTasks);
		saveTasks(updatedTasks); // Pastikan ini memanggil fungsi saveTasks
		saveCompletedTasks([...taskcompelete, completedTask]); // Tambahkan ini untuk menyimpan completedTasks
	}

	function handleTaskCompletionFromComplete(index) {
		const updatedCompleteTasks = [...taskcompelete];
		const taskToMove = updatedCompleteTasks[index];

		// Ubah properti completed menjadi false
		taskToMove.completed = false;

		// Hapus task dari taskcompelete
		updatedCompleteTasks.splice(index, 1);

		// Pindahkan task kembali ke tasks
		setTasks([...tasks, taskToMove]);

		setTasksCompelete(updatedCompleteTasks);
		saveTasks([...tasks, taskToMove]); // Simpan tasks
		saveCompletedTasks(updatedCompleteTasks); // Simpan completedTasks
	}

	function saveTasks(tasks) {
		localStorage.setItem('tasks', JSON.stringify(tasks));
	}

	function saveCompletedTasks(completedTasks) {
		localStorage.setItem('completedTasks', JSON.stringify(completedTasks));
	}

	function deleteTask(index, taskType) {
		Swal.fire({
			title: 'Confirmation',
			text: 'Are you sure you want to delete this list?',
			icon: 'warning',
			showCancelButton: true,
			confirmButtonColor: '#d33',
			cancelButtonColor: '#3085d6',
			confirmButtonText: 'Yes',
			cancelButtonText: 'No',
		}).then((result) => {
			if (result.isConfirmed) {
				if (taskType === 'tasks') {
					const clonedTasks = [...tasks];
					clonedTasks.splice(index, 1);
					setTasks(clonedTasks);
					saveTasks([...clonedTasks]);
				} else if (taskType === 'completedTasks') {
					const clonedCompletedTasks = [...taskcompelete];
					clonedCompletedTasks.splice(index, 1);
					setTasksCompelete(clonedCompletedTasks);
					saveCompletedTasks(clonedCompletedTasks);
				}
			}
		});
	}

	// Untuk menghapus list dari tasks
	function deleteTaskFromTasks(index) {
		deleteTask(index, 'tasks');
	}

	// Untuk menghapus list dari completedTasks
	function deleteTaskFromCompletedTasks(index) {
		deleteTask(index, 'completedTasks');
	}

	function loadTasks() {
		let loadedTasks = localStorage.getItem('tasks');
		let tasks = JSON.parse(loadedTasks);

		if (tasks) {
			setTasks(tasks);
		}
	}

	function loadCompletedTasks() {
		let loadedCompletedTasks = localStorage.getItem('completedTasks');
		let completedTasks = JSON.parse(loadedCompletedTasks);

		if (completedTasks) {
			setTasksCompelete(completedTasks);
		}
	}

	useEffect(() => {
		loadTasks();
		loadCompletedTasks();
	}, []); // Pastikan dependenciesnya kosong agar hanya dipanggil sekali saat komponen pertama kali dimuat.

	return (
		<ColorSchemeProvider
			colorScheme={colorScheme}
			toggleColorScheme={toggleColorScheme}>
			<MantineProvider
				theme={{ colorScheme, defaultRadius: 'md' }}
				withGlobalStyles
				withNormalizeCSS>
				<div className='App'>
					{/* Tambahkan modal untuk membuat tugas baru */}
					<Modal
						opened={isCreateModalOpened}
						size={'md'}
						title={'New Task'}
						withCloseButton={false}
						onClose={() => {
							setCreateModalOpened(false);
						}}
						centered
					>
						<TextInput
							mt={'md'}
							ref={taskTitle}
							placeholder={'Task Title'}
							required
							label={'Title'}
						/>
						<TextInput
							ref={taskSummary}
							mt={'md'}
							placeholder={'Task Summary'}
							required
							label={'Summary'}
						/>
						<DatePicker
							mt={'md'}
							label="Date input"
							required
							placeholder="Date input" v
							value={taskDate}  // Tambahkan ini
							onChange={(date) => setTaskDate(date)}  // Tambahkan ini
						/>

						<Group mt={'md'} position={'apart'}>
							<Button
								onClick={() => {
									setCreateModalOpened(false);
								}}
								variant={'subtle'}
							>
								Cancel
							</Button>
							<Button
								onClick={() => {
									createTask();
									setCreateModalOpened(false);
								}}
							>
								Create Task
							</Button>
						</Group>
					</Modal>

					{/* Tambahkan modal untuk mengedit tugas */}
					<Modal
						opened={isEditModalOpened}
						size={'md'}
						title={'Edit Task'}
						withCloseButton={false}
						onClose={() => {
							setEditModalOpened(false);
							setEditingTask(null);
						}}
						centered
					>
						<TextInput
							mt={'md'}
							ref={(input) => (taskTitle.current = input)}  // <-- Change here
							placeholder={'Task Title'}
							required
							label={'Title'}
							value={editingTask ? editingTask.title : ''}
							onChange={(event) =>
								setEditingTask({ ...editingTask, title: event.target.value })
							}
						/>
						<TextInput
							ref={(input) => (taskSummary.current = input)}  // <-- Change here
							mt={'md'}
							placeholder={'Task Summary'}
							label={'Summary'}
							value={editingTask ? editingTask.summary : ''}
							onChange={(event) =>
								setEditingTask({ ...editingTask, summary: event.target.value })
							}
						/>
						<DatePicker
							value={editingTask && editingTask.date ? new Date(editingTask.date) : new Date()}
							mt={'md'}
							onChange={(date) => setEditingTask({ ...editingTask, date })}
							label="Date input"
							placeholder="Date input"
						/>

						<Group mt={'md'} position={'apart'}>
							<Button
								onClick={() => {
									setEditModalOpened(false);
									setEditingTask(null);
								}}
								variant={'subtle'}
							>
								Cancel
							</Button>
							<Button
								onClick={() => {
									if (editingTask) {
										if (editingTask.completed === false) {
											editExistingTask(editingTask, 'tasks');
										} else {
											editExistingTask(editingTask, 'completedTasks');
										}
									}
									setEditModalOpened(false);
									setEditingTask(null);
								}}
							>
								Save Changes
							</Button>
						</Group>
					</Modal>

					<Container size={550} my={40}>
						<Group position={'apart'}>
							<Title
								sx={theme => ({
									fontFamily: `Greycliff CF, ${theme.fontFamily}`,
									fontWeight: 900,
								})}>
								My To Do List
							</Title>
							<ActionIcon
								color={'blue'}
								onClick={() => toggleColorScheme()}
								size='lg'>
								{colorScheme === 'dark' ? (
									<Sun size={16} />
								) : (
									<MoonStars size={16} />
								)}
							</ActionIcon>
						</Group>
						{tasks.length > 0 ? (
							tasks.map((task, index) => {
								if (task.title) {
									return (
										<Card withBorder key={index} mt={'sm'}>
											<Checkbox
												checked={task.completed}
												onChange={() => handleTaskCompletion(index)}
											/>
											<br />
											<Text weight={'bold'}>{task.title}</Text>

											<Text color={'dimmed'} size={'md'} mt={'sm'}>
												{task.summary
													? task.summary
													: 'No summary was provided for this task'}
											</Text>
											<Text color={'dimmed'} size={'md'} mt={'sm'}>
												{task.date
													? new Date(task.date).toLocaleDateString('en-GB') // Ganti 'en-GB' dengan locale yang sesuai
													: 'dd/mm/yyyy'}
											</Text>
											<Group position={'center'}>
												<Button variant="subtle" color="blue" radius="md" onClick={() => editTask(index, 'tasks')}>
													<Edit />
												</Button>
												<Button variant="subtle" color="red" radius="md" onClick={() => deleteTaskFromTasks(index)}>
													<Trash />
												</Button>
											</Group>
										</Card>
									);
								}
							})
						) : (
							<Text size={'lg'} mt={'md'} color={'dimmed'}>
								You have no tasks
							</Text>
						)}
						<Button
							onClick={() => setCreateModalOpened(true)}
							fullWidth mt={'md'}
						>
							New Task
						</Button>
					</Container>
					<hr />

					<Container size={550} my={40}>
						<Group position={'apart'}>
							<Title
								sx={theme => ({
									fontFamily: `Greycliff CF, ${theme.fontFamily}`,
									fontWeight: 900,
								})}>
								Complete
							</Title>
						</Group>
						{taskcompelete.length > 0 ? (
							taskcompelete.map((task, index) => {
								if (task.title) {
									return (
										<Card withBorder key={index} mt={'sm'}>
											<Checkbox
												checked={task.completed}
												onChange={() => handleTaskCompletionFromComplete(index)}
											/>
											<br />
											<Text weight={'bold'}>{task.title}</Text>

											<Text color={'dimmed'} size={'md'} mt={'sm'}>
												{task.summary
													? task.summary
													: 'No summary was provided for this task'}
											</Text>
											<Text color={'dimmed'} size={'md'} mt={'sm'}>
												{task.date
													? new Date(task.date).toLocaleDateString('en-GB') // Ganti 'en-GB' dengan locale yang sesuai
													: 'dd/mm/yyyy'}
											</Text>
											<Group position={'center'}>
												<Button variant="subtle" color="blue" radius="md" onClick={() => editTask(index, 'tasksCompelete')}>
													<Edit />
												</Button>
												<Button variant="subtle" color="red" radius="md" onClick={() => deleteTaskFromCompletedTasks(index)}>
													<Trash />
												</Button>
											</Group>
										</Card>
									);
								}
							})
						) : (
							<Text size={'lg'} mt={'md'} color={'dimmed'}>
								You have no complete tasks
							</Text>
						)}

					</Container>
				</div>
			</MantineProvider>
		</ColorSchemeProvider>
	);
}
