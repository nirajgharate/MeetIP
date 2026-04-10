import Chat from '../models/Chat.js';

export const getGroupById = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Chat.findOne({ _id: groupId, isGroup: true })
      .populate('members', 'username email avatar profession')
      .populate('admin', 'username email avatar');

    if (!group) {
      return res.status(404).json({ message: 'Group not found' });
    }

    res.status(200).json(group);
  } catch (error) {
    console.error('❌ Get Group Error:', error);
    res.status(500).json({ message: 'Failed to get group details' });
  }
};

export const updateGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const { name, description, members } = req.body;
    const currentUserId = req.user.id;

    const group = await Chat.findById(groupId);
    if (!group || !group.isGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.admin?.toString() !== currentUserId) {
      return res.status(403).json({ message: 'Only group admin can update group' });
    }

    const updateData = {};
    if (name) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (members) updateData.members = [...new Set([...members, currentUserId])];

    const updatedGroup = await Chat.findByIdAndUpdate(groupId, updateData, {
      new: true,
    })
      .populate('members', 'username email avatar profession')
      .populate('admin', 'username email avatar');

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error('❌ Update Group Error:', error);
    res.status(500).json({ message: 'Failed to update group' });
  }
};

export const removeGroupMember = async (req, res) => {
  try {
    const { groupId, userId } = req.params;
    const currentUserId = req.user.id;

    const group = await Chat.findById(groupId);
    if (!group || !group.isGroup) {
      return res.status(404).json({ message: 'Group not found' });
    }

    if (group.admin?.toString() !== currentUserId && userId !== currentUserId) {
      return res.status(403).json({ message: 'Only admin can remove other members' });
    }

    if (userId === group.admin?.toString()) {
      return res.status(400).json({ message: 'Cannot remove the group admin' });
    }

    const updatedGroup = await Chat.findByIdAndUpdate(
      groupId,
      { $pull: { members: userId } },
      { new: true },
    )
      .populate('members', 'username email avatar profession')
      .populate('admin', 'username email avatar');

    res.status(200).json(updatedGroup);
  } catch (error) {
    console.error('❌ Remove Group Member Error:', error);
    res.status(500).json({ message: 'Failed to remove member from group' });
  }
};
