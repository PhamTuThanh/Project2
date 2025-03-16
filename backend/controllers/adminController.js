

//API for adding doctor
const addDoctor = async (req, res) => {
    try {
        const { name, email, password, speciality, degree, experience, about, fees, address } = req.body;
        const imageFile = req.file;

        console.log({ name, email, password, speciality, degree, experience, about, fees, address }, imageFile);

        // Add your logic to save the doctor to the database here

        res.status(201).send('Doctor added successfully');
    } catch (error) {
        res.status(500).send('Error adding doctor');
    }
};

export { addDoctor };