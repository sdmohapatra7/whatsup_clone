package com.whatsapp.clone.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Document(collection = "groups")
public class Group {
    @Id
    private String id;
    private String name;
    private String description;
    private String groupImageUrl;
    private List<String> memberIds;
    private String adminId;
    private LocalDateTime createdAt;

    public Group() {}

    public Group(String id, String name, String description, String groupImageUrl, List<String> memberIds, String adminId, LocalDateTime createdAt) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.groupImageUrl = groupImageUrl;
        this.memberIds = memberIds;
        this.adminId = adminId;
        this.createdAt = createdAt;
    }

    public static GroupBuilder builder() {
        return new GroupBuilder();
    }

    public String getId() { return id; }
    public void setId(String id) { this.id = id; }
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    public String getDescription() { return description; }
    public void setDescription(String description) { this.description = description; }
    public String getGroupImageUrl() { return groupImageUrl; }
    public void setGroupImageUrl(String groupImageUrl) { this.groupImageUrl = groupImageUrl; }
    public List<String> getMemberIds() { return memberIds; }
    public void setMemberIds(List<String> memberIds) { this.memberIds = memberIds; }
    public String getAdminId() { return adminId; }
    public void setAdminId(String adminId) { this.adminId = adminId; }
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }

    public static class GroupBuilder {
        private String id;
        private String name;
        private String description;
        private String groupImageUrl;
        private List<String> memberIds;
        private String adminId;
        private LocalDateTime createdAt;

        public GroupBuilder id(String id) { this.id = id; return this; }
        public GroupBuilder name(String name) { this.name = name; return this; }
        public GroupBuilder description(String description) { this.description = description; return this; }
        public GroupBuilder groupImageUrl(String groupImageUrl) { this.groupImageUrl = groupImageUrl; return this; }
        public GroupBuilder memberIds(List<String> memberIds) { this.memberIds = memberIds; return this; }
        public GroupBuilder adminId(String adminId) { this.adminId = adminId; return this; }
        public GroupBuilder createdAt(LocalDateTime createdAt) { this.createdAt = createdAt; return this; }

        public Group build() {
            return new Group(id, name, description, groupImageUrl, memberIds, adminId, createdAt);
        }
    }
}
