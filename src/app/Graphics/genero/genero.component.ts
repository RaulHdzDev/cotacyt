import { Component, OnInit } from '@angular/core';
import jsPDF from 'jspdf';
import { EstadisticasService } from '../../services/estadisticas.service';
import { Color, Label } from 'ng2-charts';
import { ChartType, ChartDataSets, ChartOptions } from 'chart.js';
import * as pluginDataLabels from 'chartjs-plugin-datalabels';

@Component({
  selector: 'app-genero',
  templateUrl: './genero.component.html',
  styleUrls: ['./genero.component.scss']
})
export class GeneroComponent implements OnInit {
  public barChartOptions: ChartOptions = {
    responsive: true,
    scales: {
      xAxes: [{}], yAxes: [
        {
          ticks: {
            beginAtZero: true
          }
        }]
    },
    plugins: {
      datalabels: {
        anchor: 'center',
        align: 'center',
        color: 'black'
      }
    }
  };

  public barChartColors: Color[] = [
    { backgroundColor: '#97c83c' },
  ];
  public barChartLabels: Label[] = ['Hombre', 'Mujer'];
  public barChartType: ChartType = 'bar';
  public barChartLegend = true;
  public barChartPlugins = [pluginDataLabels];

  public barChartData: ChartDataSets[];
  asesores: [];
  constructor(private estadisticasService: EstadisticasService) { }

  ngOnInit() {
    this.barChartData = [{
      data: [],
      label: 'Participantes por genero'
    }];
    this.estadisticasService.getEstadisticasParticipantesPorGenero().subscribe(
      data => {
        this.asesores = data.estadisticas;
        const data1 = data.estadisticas.hombre;
        const data2 = data.estadisticas.Mujer;

        this.barChartData = [{
          data: [data1, data2],
          label: 'Participantes por genero'
        }];
      },
      err => {
        console.log(err);
      }
    );

  }

  // events
  public chartClicked({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }

  public chartHovered({ event, active }: { event: MouseEvent, active: {}[] }): void {
    console.log(event, active);
  }


  downloadPDF() {
    const canvas: any = document.getElementById('graGenero');
    // creates image
    const canvasImg = canvas.toDataURL('image/png', 1.0);

    // creates PDF from img
    const doc = new jsPDF('landscape');
    doc.setFontSize(20);
    doc.addImage('assets/cotacytResources/loginImages/logotamColor.png', 'png', 9, 7, 57, 28);
    doc.addImage('assets/cotacytResources/loginImages/cecit.png', 'png', 243, 5, 50, 40).setFont('Caviar').setFontSize(18).setTextColor('#646464');
    doc.text('Consejo Tamaulipeco de Ciencia y Tecnología', 91, 37);
    doc.addImage(canvasImg, 'JPEG', 15, 50, 260, 135);
    doc.save('Participantes-Por-Genero.pdf');
  }
}
