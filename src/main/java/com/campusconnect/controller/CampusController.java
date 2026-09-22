package com.campusconnect.controller;

import com.campusconnect.model.JobRole;
import com.campusconnect.model.OnCampusDrive;
import com.campusconnect.repository.DriveRepository;
import com.campusconnect.repository.JobRoleRepository;
import com.campusconnect.service.PdfGeneratorService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.IOException;
import java.util.List;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class CampusController {

    @Autowired
    private DriveRepository driveRepository;

    @Autowired
    private JobRoleRepository jobRoleRepository;

    @Autowired
    private PdfGeneratorService pdfGeneratorService;

    // --- ON-CAMPUS DRIVE ENDPOINTS ---
    
    @GetMapping("/drives")
    public ResponseEntity<List<OnCampusDrive>> getAllDrives() {
        return new ResponseEntity<>(driveRepository.findAll(), HttpStatus.OK);
    }

    @PostMapping("/admin/drives")
    public ResponseEntity<OnCampusDrive> createDrive(@RequestBody OnCampusDrive drive) {
        return new ResponseEntity<>(driveRepository.save(drive), HttpStatus.CREATED);
    }

    @GetMapping("/drives/{id}/pdf")
    public void downloadDrivePdf(@PathVariable Long id, HttpServletResponse response) throws IOException {
        response.setContentType("application/pdf");
        response.setHeader("Content-Disposition", "attachment; filename=drive_details.pdf");

        OnCampusDrive drive = driveRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Drive not found with id: " + id));

        pdfGeneratorService.generateDriveReport(drive, response.getOutputStream());
    }

    // --- SKILL MAPPING ENGINE ENDPOINTS ---

    @GetMapping("/skills/roles")
    public ResponseEntity<List<JobRole>> getAllJobRoles() {
        return new ResponseEntity<>(jobRoleRepository.findAll(), HttpStatus.OK);
    }

    @GetMapping("/skills/roles/{title}")
    public ResponseEntity<JobRole> getSkillsByRoleTitle(@PathVariable String title) {
        JobRole jobRole = jobRoleRepository.findByRoleTitle(title);
        if (jobRole == null) {
            return new ResponseEntity<>(HttpStatus.NOT_FOUND);
        }
        return new ResponseEntity<>(jobRole, HttpStatus.OK);
    }

    @PostMapping("/admin/skills/roles")
    public ResponseEntity<JobRole> createJobRole(@RequestBody JobRole jobRole) {
        return new ResponseEntity<>(jobRoleRepository.save(jobRole), HttpStatus.CREATED);
    }
}