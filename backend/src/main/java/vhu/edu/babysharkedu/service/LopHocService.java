package vhu.edu.babysharkedu.service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import vhu.edu.babysharkedu.dto.LopHocDTO;
import vhu.edu.babysharkedu.dto.LopHocRequest;
import vhu.edu.babysharkedu.dto.TreEmDTO;
import vhu.edu.babysharkedu.model.LopHoc;
import vhu.edu.babysharkedu.model.PhuHuynhTre;
import vhu.edu.babysharkedu.model.TreEm;
import vhu.edu.babysharkedu.repository.LopHocRepository;
import vhu.edu.babysharkedu.repository.PhanCongGiaoVienRepository;
import vhu.edu.babysharkedu.repository.PhuHuynhTreRepository;
import vhu.edu.babysharkedu.repository.TreEmRepository;

@Service
public class LopHocService {
    private static final int TEN_LOP_HOC_MAX_LENGTH = 50;
    private static final int DO_TUOI_MAX_LENGTH = 20;

    private final LopHocRepository lopHocRepository;
    private final TreEmRepository treEmRepository;
    private final PhanCongGiaoVienRepository phanCongGiaoVienRepository;
    private final PhuHuynhTreRepository phuHuynhTreRepository;

    public LopHocService(
            LopHocRepository lopHocRepository,
            TreEmRepository treEmRepository,
            PhanCongGiaoVienRepository phanCongGiaoVienRepository,
            PhuHuynhTreRepository phuHuynhTreRepository) {
        this.lopHocRepository = lopHocRepository;
        this.treEmRepository = treEmRepository;
        this.phanCongGiaoVienRepository = phanCongGiaoVienRepository;
        this.phuHuynhTreRepository = phuHuynhTreRepository;
    }

    @Transactional(readOnly = true)
    public List<LopHocDTO> layTatCa() {
        return lopHocRepository.findAll().stream()
                .map(this::toDTO)
                .toList();
    }

    @Transactional(readOnly = true)
    public LopHocDTO layChiTiet(Integer maLopHoc) {
        return toDTO(timLopHoc(maLopHoc));
    }

    @Transactional
    public LopHocDTO them(LopHocRequest request) {
        validate(request);

        LopHoc lopHoc = new LopHoc();
        capNhatThongTin(lopHoc, request, true);
        return toDTO(lopHocRepository.save(lopHoc));
    }

    @Transactional
    public LopHocDTO capNhat(Integer maLopHoc, LopHocRequest request) {
        validate(request);

        LopHoc lopHoc = timLopHoc(maLopHoc);
        capNhatThongTin(lopHoc, request, false);
        return toDTO(lopHocRepository.save(lopHoc));
    }

    @Transactional
    public void xoa(Integer maLopHoc) {
        LopHoc lopHoc = timLopHoc(maLopHoc);
        if (treEmRepository.existsByLopHocMaLopHoc(maLopHoc)
                || phanCongGiaoVienRepository.existsByLopHocMaLopHoc(maLopHoc)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể xóa lớp đang có trẻ hoặc giáo viên được phân công.");
        }
        lopHocRepository.delete(lopHoc);
    }

    @Transactional(readOnly = true)
    public List<TreEmDTO> layTreEm(Integer maLopHoc) {
        timLopHoc(maLopHoc);
        List<TreEm> treList = treEmRepository.findAllByLopHocMaLopHocOrderByMaTre(maLopHoc);
        if (treList.isEmpty()) {
            return List.of();
        }

        List<Integer> maTreIds = treList.stream().map(TreEm::getMaTre).toList();
        Map<Integer, PhuHuynhTre> phuHuynhMap = phuHuynhTreRepository.findAllWithPhuHuynhByTreIds(maTreIds).stream()
                .collect(Collectors.toMap(
                        lk -> lk.getTreEm().getMaTre(),
                        lk -> lk,
                        (existing, replacement) -> existing));

        return treList.stream()
                .map(tre -> {
                    PhuHuynhTre lk = phuHuynhMap.get(tre.getMaTre());
                    String tenPH = lk != null && lk.getPhuHuynh() != null
                            ? (lk.getPhuHuynh().getHoTenDemPH() + " " + lk.getPhuHuynh().getTenPH()).trim()
                            : null;
                    String quanHe = lk != null ? lk.getQuanHe() : null;
                    String sdt = lk != null && lk.getPhuHuynh() != null ? lk.getPhuHuynh().getSoDienThoai() : null;

                    return new TreEmDTO(
                            tre.getMaTre(),
                            tre.getHoTenDemTre(),
                            tre.getTenTre(),
                            tre.getNgayThangNamSinh(),
                            tre.getNoiSinh(),
                            tre.getLopHoc() == null ? null : tre.getLopHoc().getMaLopHoc(),
                            tre.getLopHoc() == null ? null : tre.getLopHoc().getTenLopHoc(),
                            tre.getTrangThaiHocTap(),
                            "/api/tre-em/" + tre.getMaTre() + "/anh-dai-dien",
                            tenPH,
                            quanHe,
                            sdt);
                })
                .toList();
    }

    private LopHoc timLopHoc(Integer maLopHoc) {
        return lopHocRepository.findById(maLopHoc)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy lớp học."));
    }

    private void validate(LopHocRequest request) {
        if (request == null
                || request.tenLopHoc() == null
                || request.tenLopHoc().isBlank()
                || request.tenLopHoc().trim().length() > TEN_LOP_HOC_MAX_LENGTH
                || request.phongHoc() == null
                || request.phongHoc() <= 0
                || (request.soLuongToiDa() != null && request.soLuongToiDa() <= 0)
                || (request.doTuoi() != null
                        && (request.doTuoi().isBlank() || request.doTuoi().trim().length() > DO_TUOI_MAX_LENGTH))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Dữ liệu lớp học không hợp lệ. Tên lớp và phòng học là bắt buộc; "
                            + "số lượng tối đa phải lớn hơn 0 và độ tuổi không vượt quá 20 ký tự.");
        }
    }

    private void capNhatThongTin(LopHoc lopHoc, LopHocRequest request, boolean taoMoi) {
        lopHoc.setTenLopHoc(request.tenLopHoc().trim());
        lopHoc.setPhongHoc(request.phongHoc());

        if (request.soLuongToiDa() != null) {
            lopHoc.setSoLuongToiDa(request.soLuongToiDa());
        } else if (taoMoi) {
            lopHoc.setSoLuongToiDa(25);
        }

        if (request.doTuoi() != null) {
            lopHoc.setDoTuoi(request.doTuoi().trim());
        } else if (taoMoi) {
            lopHoc.setDoTuoi("3-4 tuổi");
        }
    }

    private LopHocDTO toDTO(LopHoc lopHoc) {
        return new LopHocDTO(
                lopHoc.getMaLopHoc(),
                lopHoc.getTenLopHoc(),
                lopHoc.getPhongHoc(),
                lopHoc.getSoLuongToiDa(),
                lopHoc.getDoTuoi());
    }
}
