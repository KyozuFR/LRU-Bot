module.exports = async (client) => {
    console.log('Moodle reminder is running');

    try {
        const user = await client.users.fetch('372648978870697985');
        //await user.send('reminder');
        console.log(`Message sent to ${user.tag}`);
    } catch (error) {
        console.error('Error sending private message:', error);
    }
}