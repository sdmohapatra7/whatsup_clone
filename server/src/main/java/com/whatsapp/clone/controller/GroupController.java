package com.whatsapp.clone.controller;

import com.whatsapp.clone.model.Group;
import com.whatsapp.clone.repository.GroupRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/groups")
public class GroupController {

    private final GroupRepository groupRepository;

    public GroupController(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

    @PostMapping
    public ResponseEntity<Group> createGroup(@RequestBody Group group) {
        group.setCreatedAt(LocalDateTime.now());
        if (group.getGroupImageUrl() == null || group.getGroupImageUrl().isEmpty()) {
            group.setGroupImageUrl("https://ui-avatars.com/api/?name=" + group.getName().replace(" ", "+") + "&background=random");
        }
        return ResponseEntity.ok(groupRepository.save(group));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Group>> getUserGroups(@PathVariable("userId") String userId) {
        return ResponseEntity.ok(groupRepository.findByMemberIdsContaining(userId));
    }

    @GetMapping("/{groupId}")
    public ResponseEntity<Group> getGroupById(@PathVariable("groupId") String groupId) {
        return groupRepository.findById(groupId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PutMapping("/{id}")
    public ResponseEntity<Group> updateGroup(@PathVariable("id") String id, @RequestBody Group groupUpdate) {
        return groupRepository.findById(id).map(group -> {
            if (groupUpdate.getName() != null) group.setName(groupUpdate.getName());
            if (groupUpdate.getDescription() != null) group.setDescription(groupUpdate.getDescription());
            if (groupUpdate.getGroupImageUrl() != null) group.setGroupImageUrl(groupUpdate.getGroupImageUrl());
            if (groupUpdate.getMemberIds() != null) group.setMemberIds(groupUpdate.getMemberIds());
            return ResponseEntity.ok(groupRepository.save(group));
        }).orElse(ResponseEntity.notFound().build());
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteGroup(@PathVariable("id") String id) {
        if (groupRepository.existsById(id)) {
            groupRepository.deleteById(id);
            return ResponseEntity.ok().build();
        }
        return ResponseEntity.notFound().build();
    }
}
